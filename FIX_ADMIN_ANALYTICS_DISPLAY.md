# Исправление отображения аналитики в админ-панели

## Проблема
В админке у пользователя поле рекомендаций и аналитики пустое, хотя в календаре пользователя эти данные есть.

## Причина
Обнаружено несоответствие в использовании ID пользователей:

### Структура базы данных
```
┌─────────────────────────────────────────────────────┐
│ auth.users.id (UUID)                                │
│ "123e4567-e89b-12d3-a456-426614174000"             │
└───────────────┬─────────────────────────────────────┘
                │
                │ Ссылается
                ↓
┌─────────────────────────────────────────────────────┐
│ public.users                                         │
├─────────────────────────────────────────────────────┤
│ id (UUID) - Внутренний ID (ДРУГОЕ значение!)       │
│ "98765432-abcd-1234-efgh-567890123456"             │
│                                                      │
│ sso_uid (TEXT) - То же что auth.users.id           │
│ "123e4567-e89b-12d3-a456-426614174000"             │
└─────────────────────────────────────────────────────┘
                │                 │
        ┌───────┘                 └────────┐
        ↓                                  ↓
┌──────────────────┐          ┌───────────────────────┐
│ daily_entries    │          │ monthly_analytics     │
├──────────────────┤          ├───────────────────────┤
│ user_id → users.id│         │ user_id → auth.users.id│
│ (внутренний ID)  │          │ (= sso_uid)           │
└──────────────────┘          └───────────────────────┘
```

**Проблема была:**
- URL в админ-панели использовал `user.id` (внутренний ID)
- API аналитики ожидал `sso_uid`
- Результат: данные не находились

## Решение

### 1. Исправлен URL в списке пользователей
**Файл:** `src/app/admin/users/page.tsx`

```tsx
// Было:
<Link href={`/admin/users/${user.id}`}>

// Стало:
<Link href={`/admin/users/${user.sso_uid}`}>
```

### 2. Исправлен API получения записей пользователя
**Файл:** `src/app/api/admin/users/[userId]/entries/route.ts`

```typescript
// Теперь userId интерпретируется как sso_uid
const { data: user } = await supabase
  .from('users')
  .select('id, sso_uid, email, full_name')
  .eq('sso_uid', userId)  // ← Было: .eq('id', userId)
  .single()

// Используем внутренний id для daily_entries
const { data: entries } = await supabase
  .from('daily_entries')
  .select('*')
  .eq('user_id', user.id)  // ← Используем users.id
```

### 3. API аналитики уже работает правильно
**Файл:** `src/app/api/admin/users/[userId]/analytics/route.ts`

Использует `userId` (sso_uid) напрямую, что правильно:
```typescript
const { data: analytics } = await supabase
  .from('monthly_analytics')
  .select('*')
  .eq('user_id', userId)  // userId = sso_uid = auth.users.id ✓
```

### 4. Исправлен API генерации аналитики
**Файл:** `src/app/api/admin/users/[userId]/analytics/generate/route.ts`

```typescript
// Получаем users.id по sso_uid для запроса к daily_entries
const { data: userData } = await supabase
  .from('users')
  .select('id, sso_uid')
  .eq('sso_uid', userId)
  .single()

// Используем users.id для daily_entries
const { data: entries } = await supabase
  .from('daily_entries')
  .eq('user_id', userData.id)

// Используем sso_uid для monthly_analytics
await supabase
  .from('monthly_analytics')
  .insert({
    user_id: userId,  // userId = sso_uid ✓
    // ...
  })
```

### 5. Исправлен API обновления пользователя
**Файл:** `src/app/api/admin/users/[userId]/route.ts`

```typescript
// Все запросы к таблице users теперь используют sso_uid
const { data: user } = await supabase
  .from('users')
  .select('email, full_name, sso_uid')
  .eq('sso_uid', userId)  // ← Было: .eq('id', userId)
```

## Список измененных файлов

1. ✅ `src/app/admin/users/page.tsx`
2. ✅ `src/app/api/admin/users/[userId]/entries/route.ts`
3. ✅ `src/app/api/admin/users/[userId]/route.ts`
4. ✅ `src/app/api/admin/users/[userId]/analytics/generate/route.ts`
5. ✅ `src/app/api/admin/users/[userId]/analytics/route.ts` (проверен, изменений не требуется)

## Тестирование

### Шаг 1: Убедитесь, что миграции применены
Проверьте в Supabase SQL Editor:

```sql
-- Должны быть политики для админов
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'monthly_analytics' 
AND schemaname = 'public'
AND policyname LIKE '%admin%';
```

Ожидаемый результат:
- `Admins can read all monthly analytics` (SELECT)
- `Admins can update all monthly analytics` (UPDATE)
- `Admins can insert monthly analytics for any user` (INSERT)

### Шаг 2: Проверьте наличие данных
```sql
SELECT 
    ma.user_id,
    u.email,
    u.sso_uid,
    ma.year,
    ma.month,
    ma.week_number,
    LENGTH(ma.recommendations) as rec_length
FROM monthly_analytics ma
LEFT JOIN users u ON u.sso_uid = ma.user_id::text
ORDER BY ma.created_at DESC
LIMIT 5;
```

### Шаг 3: Протестируйте в UI
1. Соберите и запустите проект:
   ```bash
   npm run build
   npm run dev
   ```

2. Войдите как админ

3. Перейдите в раздел "Пользователи"

4. Кликните на имя пользователя с существующей аналитикой

5. **Ожидаемый результат:**
   - ✅ Таблица с записями пользователя отображается
   - ✅ Справа показана панель "Аналитика и рекомендации"
   - ✅ Отображаются все секции: общее впечатление, положительные тенденции, рекомендации и т.д.
   - ✅ Показывается информация о неделе и количестве дней

6. Попробуйте нажать "Обновить рекомендации" - должна сгенерироваться новая аналитика

### Шаг 4: Проверьте консоль браузера
Не должно быть ошибок типа:
- ❌ `Failed to fetch analytics`
- ❌ `User not found`
- ❌ `Forbidden`

## Деплой

После успешного тестирования локально:

```bash
# Закоммитьте изменения
git add .
git commit -m "Fix admin analytics display by using sso_uid in URLs"

# Отправьте на Vercel
git push origin main
```

## Если проблема не решена

### 1. Проверьте, что пользователь - админ
```sql
SELECT 
    p.user_id,
    p.email,
    p.role,
    p.active,
    u.sso_uid
FROM psychologists p
JOIN users u ON u.sso_uid = p.user_id
WHERE p.role = 'admin';
```

### 2. Проверьте RLS политики вручную
```sql
-- От имени админа
SET request.jwt.claims = '{"sub": "YOUR_ADMIN_SSO_UID"}';

-- Попытка выбрать аналитику
SELECT * FROM monthly_analytics LIMIT 1;
```

### 3. Проверьте логи в Vercel
- Откройте Dashboard > Your Project > Logs
- Найдите запросы к `/api/admin/users/[userId]/analytics`
- Проверьте сообщения `[Admin Analytics GET]`

## Дополнительно

Для упрощения работы в будущем рекомендуется:

1. **Стандартизировать ID:** Использовать везде `sso_uid` для внешних ссылок
2. **Добавить проверки:** Валидировать UUID формат в API
3. **Улучшить типизацию:** Создать отдельные типы для `InternalUserId` и `SsoUserId`
