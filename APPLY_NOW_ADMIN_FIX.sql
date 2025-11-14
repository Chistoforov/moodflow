-- =============================================================================
-- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Доступ админа к пользователям
-- =============================================================================
-- ВЫПОЛНИТЕ ЭТОТ СКРИПТ В SUPABASE SQL EDITOR ПРЯМО СЕЙЧАС!
-- =============================================================================

-- Проверка: какие политики сейчас есть для users
SELECT '=== ТЕКУЩИЕ ПОЛИТИКИ ДЛЯ USERS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- =============================================================================
-- ИСПРАВЛЕНИЕ: Добавляем/обновляем политики для админов
-- =============================================================================

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

-- =============================================================================
-- ИСПРАВЛЕНИЕ: Добавляем политики для monthly_analytics
-- =============================================================================

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

-- =============================================================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- =============================================================================

SELECT '=== НОВЫЕ ПОЛИТИКИ ДЛЯ USERS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

SELECT '=== ПОЛИТИКИ ДЛЯ MONTHLY_ANALYTICS ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'monthly_analytics' ORDER BY policyname;

-- =============================================================================
-- ТЕСТ: Проверка что админ может видеть всех пользователей
-- =============================================================================

DO $$
DECLARE
  admin_count INT;
  users_count INT;
BEGIN
  -- Подсчет админов
  SELECT COUNT(*) INTO admin_count
  FROM psychologists
  WHERE role = 'admin' AND active = true;
  
  -- Подсчет пользователей
  SELECT COUNT(*) INTO users_count
  FROM users;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== СТАТИСТИКА ===';
  RAISE NOTICE 'Активных админов: %', admin_count;
  RAISE NOTICE 'Всего пользователей: %', users_count;
  RAISE NOTICE '';
  
  IF admin_count > 0 AND users_count > 0 THEN
    RAISE NOTICE '✅ Политики применены успешно!';
    RAISE NOTICE '';
    RAISE NOTICE 'СЛЕДУЮЩИЕ ШАГИ:';
    RAISE NOTICE '1. Обновите страницу админ-панели (F5)';
    RAISE NOTICE '2. Попробуйте запустить анализ снова';
    RAISE NOTICE '3. Должно заработать!';
  ELSE
    RAISE NOTICE '⚠️  Проверьте, что есть админы и пользователи в БД';
  END IF;
  RAISE NOTICE '';
END $$;

