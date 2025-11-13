# Исправление ошибки RLS для monthly_analytics

## Проблема
Ошибка: `new row violates row-level security policy for table "monthly_analytics"` (код 42501)

## Причины
1. **API код проверял админа неправильно**: использовал `authUser.id` вместо `users.sso_uid` для проверки `psychologists.user_id`
2. **RLS политики не давали админам INSERT права**: нужна политика для вставки аналитики от имени любого пользователя

## Что исправлено

### 1. API код (`src/app/api/admin/analytics/manual/route.ts`)
✅ Теперь сначала получаем `sso_uid` из таблицы `users`, затем проверяем роль админа через `psychologists.user_id`

### 2. Миграции
- ✅ `024_create_monthly_analytics_fixed.sql` - создание таблицы с базовыми RLS политиками
- ✅ `025_fix_monthly_analytics_admin_insert_fixed.sql` - добавление политик для админов (INSERT, UPDATE, DELETE)

## Как применить исправления

### Шаг 1: Проверить, какие миграции уже применены

```bash
# В локальной базе Supabase
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
SELECT version 
FROM supabase_migrations.schema_migrations 
WHERE name LIKE '%monthly_analytics%' 
ORDER BY version;
"
```

### Шаг 2: Удалить старые таблицы и политики (если есть проблемы)

```sql
-- Подключитесь к вашей Supabase базе через Dashboard > SQL Editor

-- Удалить существующие политики
DROP POLICY IF EXISTS "Admins can insert monthly analytics for any user" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can update monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can delete monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Users can read their own monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Service role can manage monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Users can insert their own monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can read all monthly analytics" ON public.monthly_analytics;

-- Удалить таблицу
DROP TABLE IF EXISTS public.monthly_analytics CASCADE;
```

### Шаг 3: Применить миграции заново

#### Вариант А: Через Supabase CLI (рекомендуется)

```bash
# 1. Убедитесь, что Supabase CLI установлен
supabase --version

# 2. Примените миграцию 024 (создание таблицы)
supabase migration up --local --file 024_create_monthly_analytics_fixed.sql

# 3. Примените миграцию 025 (политики для админов)
supabase migration up --local --file 025_fix_monthly_analytics_admin_insert_fixed.sql

# 4. Для production (Vercel)
supabase db push --linked
```

#### Вариант Б: Через Supabase Dashboard (если CLI не работает)

1. Откройте Supabase Dashboard > SQL Editor
2. Скопируйте содержимое `supabase/migrations/024_create_monthly_analytics_fixed.sql`
3. Выполните SQL
4. Скопируйте содержимое `supabase/migrations/025_fix_monthly_analytics_admin_insert_fixed.sql`
5. Выполните SQL

### Шаг 4: Проверить политики

```sql
-- Проверить, что все политики созданы
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'monthly_analytics'
ORDER BY policyname;
```

Вы должны увидеть 7 политик:
1. ✅ "Admins can delete monthly analytics" - DELETE
2. ✅ "Admins can insert monthly analytics for any user" - INSERT
3. ✅ "Admins can read all monthly analytics" - SELECT
4. ✅ "Admins can update monthly analytics" - UPDATE
5. ✅ "Service role can manage monthly analytics" - ALL
6. ✅ "Users can insert their own monthly analytics" - INSERT
7. ✅ "Users can read their own monthly analytics" - SELECT

### Шаг 5: Тестирование

1. Перезапустите dev сервер:
```bash
npm run dev
```

2. Откройте админ панель и попробуйте создать анализ для пользователя

3. Проверьте логи в Vercel Function (если на production):
```
✅ Perplexity analysis completed successfully
✅ Analytics saved successfully
```

## Проверка структуры данных

### Проверить таблицу monthly_analytics

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'monthly_analytics'
ORDER BY ordinal_position;
```

### Проверить связь users -> psychologists

```sql
-- Проверить вашего админа
SELECT 
  u.id as user_uuid,
  u.sso_uid as user_sso_uid,
  u.email,
  p.user_id as psych_user_id,
  p.role,
  p.active
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'ваш_email@example.com';
```

Убедитесь, что:
- ✅ `u.sso_uid` = `p.user_id` (оба TEXT)
- ✅ `p.role` = 'admin'
- ✅ `p.active` = true

## Возможные проблемы

### Проблема 1: "Policy already exists"
```
ERROR: policy "Admins can insert monthly analytics for any user" for table "monthly_analytics" already exists
```

**Решение**: Сначала удалите существующие политики (Шаг 2)

### Проблема 2: "Table monthly_analytics does not exist"
```
ERROR: relation "public.monthly_analytics" does not exist
```

**Решение**: Примените миграцию 024 сначала

### Проблема 3: "User not found" в API
```
GET /api/admin/analytics/manual 404
{ error: 'User not found' }
```

**Решение**: Проверьте, что запись пользователя есть в таблице `users`:
```sql
SELECT id, sso_uid, email, full_name 
FROM users 
WHERE email = 'ваш_email@example.com';
```

### Проблема 4: "Forbidden: Admin access required"
```
POST /api/admin/analytics/manual 403
{ error: 'Forbidden: Admin access required' }
```

**Решение**: Проверьте связь users <-> psychologists:
```sql
SELECT 
  u.email,
  p.role,
  p.active,
  u.sso_uid,
  p.user_id
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'ваш_email@example.com';
```

Если `p.user_id` IS NULL, значит запись в `psychologists` не создана или неправильно связана.

## Дальнейшие действия

После успешного применения миграций:

1. ✅ Протестируйте создание анализа в dev режиме
2. ✅ Задеплойте изменения на Vercel:
```bash
git add .
git commit -m "fix: исправление RLS политик для monthly_analytics"
git push origin main
```
3. ✅ Примените миграции на production через Supabase Dashboard
4. ✅ Протестируйте на production

## Контрольный список

- [ ] API код обновлен (использует sso_uid)
- [ ] Миграция 024 применена (таблица создана)
- [ ] Миграция 025 применена (политики для админов)
- [ ] Проверены все 7 RLS политик
- [ ] Проверена связь users <-> psychologists для вашего админа
- [ ] Протестировано создание анализа в dev
- [ ] Изменения задеплоены на Vercel
- [ ] Миграции применены на production
- [ ] Протестировано на production

---

**Дата**: 2025-11-13  
**Статус**: Готово к применению  
**Файлы**: 
- ✅ `src/app/api/admin/analytics/manual/route.ts` (исправлен)
- ✅ `supabase/migrations/024_create_monthly_analytics_fixed.sql`
- ✅ `supabase/migrations/025_fix_monthly_analytics_admin_insert_fixed.sql`

