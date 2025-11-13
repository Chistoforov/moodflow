-- ==========================================
-- ПРОСТОЕ ИСПРАВЛЕНИЕ РОЛИ АДМИНА
-- Скопируйте и выполните в Supabase SQL Editor
-- ==========================================

-- 1. Создаем/обновляем запись админа
INSERT INTO psychologists (user_id, email, full_name, role, active)
SELECT 
  u.sso_uid,
  'site4people@gmail.com',
  COALESCE(u.full_name, 'Admin'),
  'admin',
  true
FROM users u
WHERE u.email = 'site4people@gmail.com'
ON CONFLICT (email) DO UPDATE
SET 
  user_id = EXCLUDED.user_id,
  role = 'admin',
  active = true,
  updated_at = NOW();

-- 2. Добавляем политику для просмотра всех пользователей
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admins can view all users'
  ) THEN
    CREATE POLICY "Admins can view all users" ON users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM psychologists p
          WHERE p.user_id = auth.uid()::text
          AND p.role = 'admin'
          AND p.active = true
        )
      );
  END IF;
END $$;

-- 3. Добавляем политику для обновления пользователей
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admins can update all users'
  ) THEN
    CREATE POLICY "Admins can update all users" ON users
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM psychologists p
          WHERE p.user_id = auth.uid()::text
          AND p.role = 'admin'
          AND p.active = true
        )
      );
  END IF;
END $$;

-- 4. ПРОВЕРКА - должно показать role='admin', active=true
SELECT 
  u.email,
  u.subscription_tier,
  p.role as admin_role,
  p.active
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'site4people@gmail.com';

