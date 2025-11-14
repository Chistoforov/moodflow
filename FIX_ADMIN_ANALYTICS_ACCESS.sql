-- =============================================================================
-- БЫСТРОЕ ИСПРАВЛЕНИЕ: Доступ админа к аналитике пользователей
-- =============================================================================
-- Выполните этот скрипт целиком в Supabase SQL Editor
-- =============================================================================

-- ШАГ 1: Проверка текущей ситуации
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== ШАГ 1: Проверка текущих админов ===';
END $$;

SELECT 
  p.id,
  p.user_id as sso_uid,
  p.email,
  p.full_name,
  p.role,
  p.active,
  u.id as user_uuid_id,
  u.email as user_email
FROM psychologists p
LEFT JOIN users u ON u.sso_uid = p.user_id
WHERE p.role = 'admin' AND p.active = true;

-- ШАГ 2: Исправление RLS политик для users
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== ШАГ 2: Исправление RLS политик для users ===';
END $$;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Recreate admin SELECT policy with proper auth.uid() checking
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    -- Allow users to see their own data
    auth.uid()::text = sso_uid
    OR
    -- Allow admins to see all users
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Recreate admin UPDATE policy
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    -- Allow users to update their own data
    auth.uid()::text = sso_uid
    OR
    -- Allow admins to update all users
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- ШАГ 3: Исправление RLS политик для monthly_analytics
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== ШАГ 3: Исправление RLS политик для monthly_analytics ===';
END $$;

DROP POLICY IF EXISTS "Admins can insert monthly analytics for any user" ON monthly_analytics;
DROP POLICY IF EXISTS "Admins can view all monthly analytics" ON monthly_analytics;

-- Allow admins to insert analytics for any user
CREATE POLICY "Admins can insert monthly analytics for any user" ON monthly_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Allow admins to view all analytics
CREATE POLICY "Admins can view all monthly analytics" ON monthly_analytics
  FOR SELECT USING (
    -- Users can see their own analytics
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = monthly_analytics.user_id
      AND u.sso_uid = auth.uid()::text
    )
    OR
    -- Admins can see all analytics
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- ШАГ 4: Проверка политик
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== ШАГ 4: Проверка созданных политик ===';
END $$;

-- Проверить RLS политики для users
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'users' AND policyname LIKE '%Admin%'
ORDER BY policyname;

-- Проверить RLS политики для monthly_analytics
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'monthly_analytics' AND policyname LIKE '%Admin%'
ORDER BY policyname;

-- ШАГ 5: Проверка доступа (опционально)
-- =============================================================================
-- Раскомментируйте эти строки, если хотите проверить доступ
-- ВАЖНО: Замените 'YOUR_EMAIL@example.com' на ваш реальный email

/*
DO $$
DECLARE
  test_user_id UUID;
  test_sso_uid TEXT;
BEGIN
  RAISE NOTICE '=== ШАГ 5: Проверка доступа ===';
  
  -- Найти вашего пользователя
  SELECT id, sso_uid INTO test_user_id, test_sso_uid
  FROM users 
  WHERE email = 'YOUR_EMAIL@example.com'
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Найден пользователь: id=%, sso_uid=%', test_user_id, test_sso_uid;
    
    -- Проверить, есть ли запись в psychologists
    IF EXISTS (
      SELECT 1 FROM psychologists 
      WHERE user_id = test_sso_uid 
      AND role = 'admin' 
      AND active = true
    ) THEN
      RAISE NOTICE '✓ Пользователь является активным админом';
    ELSE
      RAISE NOTICE '✗ ВНИМАНИЕ: Пользователь НЕ является активным админом!';
      RAISE NOTICE 'Выполните INSERT в таблицу psychologists для добавления админа';
    END IF;
  ELSE
    RAISE NOTICE '✗ ВНИМАНИЕ: Пользователь с таким email не найден!';
  END IF;
END $$;
*/

-- =============================================================================
-- ГОТОВО!
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== МИГРАЦИЯ ЗАВЕРШЕНА ===';
  RAISE NOTICE 'Теперь вернитесь в админ-панель и попробуйте запустить анализ снова';
END $$;

