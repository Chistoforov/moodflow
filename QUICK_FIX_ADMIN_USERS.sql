-- ============================================
-- QUICK FIX: Admin Users Policy
-- ============================================
-- Проблема: Админ не видит других пользователей
-- Решение: Добавить RLS политики для админов
-- ============================================

-- Добавить политику для просмотра всех пользователей админами
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Добавить политику для обновления всех пользователей админами
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Проверка: вывести все активные политики для таблицы users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';

