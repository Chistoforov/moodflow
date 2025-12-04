# Проверка администратора на Vercel

## Шаг 1: Проверьте логи Vercel

1. Откройте https://vercel.com/
2. Перейдите в ваш проект MoodFlow
3. Нажмите "Logs" или "Runtime Logs"
4. Найдите логи с текстом:
   - `checkAdminRole - Starting check`
   - `checkAdminRole - User query result`
   - `checkAdminRole - Psychologist query result`
   - `POST /api/admin/posts - Admin check result`

## Шаг 2: Проверьте данные в Supabase

Откройте Supabase SQL Editor и выполните:

```sql
-- Проверка соответствия данных администратора
SELECT 
  'Auth User' as source,
  au.id as auth_id,
  au.email
FROM auth.users au
WHERE au.email = 'site4people@gmail.com'

UNION ALL

SELECT 
  'Public User' as source,
  u.sso_uid as auth_id,
  u.email
FROM public.users u
WHERE u.email = 'site4people@gmail.com'

UNION ALL

SELECT 
  'Psychologist' as source,
  p.user_id as auth_id,
  p.email
FROM public.psychologists p
WHERE p.email = 'site4people@gmail.com';
```

## Шаг 3: Проверьте, что миграция 020 применена

```sql
-- Проверка что user_id совпадает с sso_uid
SELECT 
  u.sso_uid,
  p.user_id,
  p.role,
  p.active,
  CASE 
    WHEN u.sso_uid = p.user_id THEN '✓ OK'
    ELSE '✗ MISMATCH - RUN MIGRATION 020!'
  END as status
FROM public.users u
INNER JOIN public.psychologists p ON p.email = u.email
WHERE u.email = 'site4people@gmail.com';
```

## Шаг 4: Если данные не совпадают, примените миграцию

Если статус показывает "MISMATCH", выполните в Supabase SQL Editor:

```sql
-- Обновление user_id в psychologists
UPDATE psychologists 
SET user_id = (
  SELECT sso_uid FROM users WHERE email = 'site4people@gmail.com' LIMIT 1
)
WHERE email = 'site4people@gmail.com';

-- Проверка результата
SELECT 
  user_id,
  email,
  role,
  active
FROM psychologists
WHERE email = 'site4people@gmail.com';
```

После этого обновите страницу на moodflow-ashen.vercel.app и попробуйте снова.

