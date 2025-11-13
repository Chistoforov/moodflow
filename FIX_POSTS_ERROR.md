# Исправление ошибки "Failed to create post"

## Проблема
Таблица `posts` имеет RLS (Row Level Security), но есть только политика для чтения постов, нет политик для создания/обновления/удаления.

## Решение
Нужно применить 2 миграции в Supabase SQL Editor:

### Шаг 1: Откройте Supabase SQL Editor
1. Перейдите на https://supabase.com/
2. Откройте ваш проект MoodFlow
3. Нажмите "SQL Editor" в боковом меню
4. Нажмите "New query"

### Шаг 2: Примените миграцию 020 (исправление user_id)
Скопируйте и выполните содержимое файла `supabase/migrations/020_fix_admin_user_id.sql`:

```sql
-- Fix admin user_id in psychologists table
UPDATE psychologists 
SET user_id = (
  SELECT sso_uid FROM users WHERE email = 'site4people@gmail.com' LIMIT 1
)
WHERE email = 'site4people@gmail.com'
AND user_id IS NOT NULL;

-- Fix the trigger function
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
DECLARE
  v_sso_uid TEXT;
BEGIN
  IF NEW.email = 'site4people@gmail.com' THEN
    SELECT sso_uid INTO v_sso_uid
    FROM public.users
    WHERE email = NEW.email
    LIMIT 1;
    
    IF v_sso_uid IS NOT NULL THEN
      INSERT INTO public.psychologists (user_id, email, full_name, role, active)
      VALUES (v_sso_uid, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin'), 'admin', true)
      ON CONFLICT (email) DO UPDATE
      SET user_id = v_sso_uid, role = 'admin', active = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_user();

INSERT INTO psychologists (user_id, email, full_name, role, active)
SELECT 
  u.sso_uid,
  'site4people@gmail.com',
  'Admin',
  'admin',
  true
FROM users u
WHERE u.email = 'site4people@gmail.com'
ON CONFLICT (email) DO UPDATE
SET user_id = EXCLUDED.user_id, role = 'admin', active = true;
```

### Шаг 3: Примените миграцию 021 (политики для posts)
Скопируйте и выполните содержимое файла `supabase/migrations/021_add_posts_admin_policies.sql`:

```sql
-- Add RLS policies for posts table to allow admins to create/update/delete posts

-- Policy for admins to insert posts
CREATE POLICY "Admins can insert posts" ON posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.id = author_id
        AND p.role = 'admin'
        AND p.active = true
    )
  );

-- Policy for admins to update posts
CREATE POLICY "Admins can update posts" ON posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

-- Policy for admins to delete posts
CREATE POLICY "Admins can delete posts" ON posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

-- Policy for admins to view all posts (including unpublished)
CREATE POLICY "Admins can view all posts" ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );
```

### Шаг 4: Проверьте результат
После выполнения обеих миграций проверьте:

```sql
-- Проверка 1: user_id совпадает
SELECT 
  u.sso_uid,
  p.user_id,
  p.role,
  p.active,
  CASE WHEN u.sso_uid = p.user_id THEN '✓' ELSE '✗' END as match
FROM users u
JOIN psychologists p ON p.email = u.email
WHERE u.email = 'site4people@gmail.com';

-- Проверка 2: Политики созданы
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY cmd, policyname;
```

Должны увидеть 5 политик для posts:
- Anyone can view published posts (SELECT)
- Admins can view all posts (SELECT)
- Admins can insert posts (INSERT)
- Admins can update posts (UPDATE)
- Admins can delete posts (DELETE)

### Шаг 5: Тестирование
1. Обновите страницу https://moodflow-six.vercel.app/admin/materials (Ctrl+Shift+R / Cmd+Shift+R)
2. Попробуйте создать новый материал
3. Должно работать! ✨

## Что было не так?
1. В таблице `psychologists` поле `user_id` не совпадало с `sso_uid` из таблицы `users`
2. В таблице `posts` был включен RLS, но не было политик для INSERT/UPDATE/DELETE

## Если все еще не работает
Проверьте логи в консоли браузера (F12) и отправьте мне скриншот.

