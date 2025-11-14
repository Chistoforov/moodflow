# Применение миграции 028 - Исправление доступа админов к пользователям

## Проблема
При запуске анализа возникает ошибка "User not found" из-за RLS политик, которые блокируют доступ админа к данным пользователей.

## Решение

### Шаг 1: Проверить текущего пользователя-админа

Выполните в Supabase SQL Editor:

```sql
-- Проверить текущих админов
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.active,
  u.id as user_uuid_id
FROM psychologists p
LEFT JOIN users u ON u.sso_uid = p.user_id
WHERE p.role = 'admin' AND p.active = true;
```

### Шаг 2: Если нужно, добавить себя как админа

Если вы не видите себя в списке админов, выполните:

```sql
-- Сначала найдите свой sso_uid
SELECT id, email, sso_uid FROM users WHERE email = 'ВАШ_EMAIL@example.com';

-- Потом добавьте себя как админа
INSERT INTO psychologists (user_id, email, full_name, role, active)
VALUES (
  'ВАШ_SSO_UID', -- из предыдущего запроса
  'ВАШ_EMAIL@example.com',
  'Ваше Имя',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  active = true;
```

### Шаг 3: Применить миграцию

Скопируйте содержимое файла `supabase/migrations/028_fix_admin_users_access.sql` и выполните в Supabase SQL Editor.

Или используйте Supabase CLI:

```bash
# Войдите в Supabase CLI (если еще не вошли)
npx supabase login

# Свяжите проект
npx supabase link --project-ref YOUR_PROJECT_REF

# Примените миграцию
npx supabase db push
```

### Шаг 4: Проверить политики

После применения миграции проверьте, что политики созданы:

```sql
-- Проверить RLS политики для users
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Проверить RLS политики для monthly_analytics
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'monthly_analytics'
ORDER BY policyname;
```

### Шаг 5: Тестирование

Вернитесь на страницу админ-панели и попробуйте запустить анализ снова. Теперь должно работать!

## Что делает миграция

1. **Обновляет RLS политики для таблицы `users`**:
   - Пользователи могут видеть свои данные
   - Админы могут видеть данные всех пользователей
   - Админы могут обновлять данные всех пользователей

2. **Обновляет RLS политики для таблицы `monthly_analytics`**:
   - Пользователи могут видеть свою аналитику
   - Админы могут видеть всю аналитику
   - Админы могут создавать аналитику для любого пользователя

## Важно!

Убедитесь, что вы авторизованы под пользователем, который:
1. Есть в таблице `users`
2. Есть в таблице `psychologists` с `role = 'admin'` и `active = true`
3. `psychologists.user_id` совпадает с `users.sso_uid` вашего пользователя

