# Применение миграции 025: Исправление доступа админов к аналитике

## Проблема
В админ-панели не отображаются рекомендации и аналитика пользователей, хотя у самих пользователей эти данные есть. Проблема в том, что политики RLS (Row Level Security) не позволяют админам читать данные из таблицы `monthly_analytics`.

## Решение
Миграция `025_fix_admin_analytics_access.sql` пересоздает все политики для таблицы `monthly_analytics`, добавляя политики, которые позволяют админам:
- Читать аналитику всех пользователей
- Обновлять аналитику всех пользователей
- Создавать аналитику для любого пользователя

## Шаги применения

### 1. Проверка текущих политик (опционально)

Сначала можно проверить текущее состояние политик:

```bash
# Войдите в SQL редактор Supabase Dashboard
# Выполните запрос из файла CHECK_ANALYTICS_POLICIES.sql
```

### 2. Применение миграции через Supabase CLI

```bash
# Убедитесь, что вы находитесь в корневой директории проекта
cd /Users/d.chistoforov/Desktop/MoodFlow

# Примените миграцию
npx supabase db push
```

### 3. Альтернативный способ: Применение через Supabase Dashboard

Если CLI не работает, можно применить миграцию вручную через Dashboard:

1. Откройте Supabase Dashboard: https://app.supabase.com
2. Выберите ваш проект
3. Перейдите в раздел **SQL Editor**
4. Создайте новый запрос
5. Скопируйте содержимое файла `supabase/migrations/025_fix_admin_analytics_access.sql`
6. Вставьте в редактор и нажмите **Run**

### 4. Проверка результата

После применения миграции:

1. Перезагрузите страницу админ-панели
2. Откройте страницу пользователя, у которого есть аналитика
3. Убедитесь, что аналитика и рекомендации отображаются

### 5. Проверка политик (опционально)

Проверьте, что политики были созданы:

```sql
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'monthly_analytics' 
AND schemaname = 'public'
ORDER BY policyname;
```

Должны быть видны следующие политики:
- `Admins can insert monthly analytics for any user`
- `Admins can read all monthly analytics`
- `Admins can update all monthly analytics`
- `Users can read their own monthly analytics`
- `Users can insert their own monthly analytics`
- `Users can update their own monthly analytics`
- `Service role can manage monthly analytics`

## Troubleshooting

### Если аналитика все еще не отображается:

1. **Проверьте, что админ авторизован:**
   ```sql
   SELECT 
     p.user_id,
     p.email,
     p.role,
     p.active
   FROM psychologists p
   WHERE p.user_id = auth.uid()::text;
   ```

2. **Проверьте, что данные существуют:**
   ```sql
   SELECT * FROM monthly_analytics 
   WHERE user_id = 'USER_ID_HERE' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Проверьте логи в браузере:**
   - Откройте DevTools (F12)
   - Перейдите на вкладку Console
   - Обновите страницу админ-панели
   - Проверьте наличие ошибок

4. **Проверьте логи API:**
   - Откройте DevTools (F12)
   - Перейдите на вкладку Network
   - Найдите запрос к `/api/admin/users/[userId]/analytics`
   - Проверьте статус и ответ

### Если ошибка "Unauthorized" или "Forbidden":

Убедитесь, что текущий пользователь действительно является админом:

```sql
-- Проверить текущего пользователя
SELECT auth.uid();

-- Проверить роль
SELECT * FROM psychologists WHERE user_id = auth.uid()::text;
```

Если роль не 'admin' или active = false, обновите запись:

```sql
UPDATE psychologists 
SET role = 'admin', active = true 
WHERE user_id = 'YOUR_SSO_UID';
```

## Дополнительные файлы

- `CHECK_ANALYTICS_POLICIES.sql` - скрипт для проверки текущего состояния политик
- `supabase/migrations/025_fix_admin_analytics_access.sql` - миграция для исправления политик

## Заметки

- Миграция безопасна и может быть применена многократно
- Существующие данные не будут изменены или удалены
- Только политики RLS будут пересозданы
