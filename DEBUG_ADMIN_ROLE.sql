-- ============================================
-- ДИАГНОСТИКА: Проверка роли админа
-- ============================================

-- 1. Проверка данных пользователя в таблице users
SELECT 
  id,
  sso_uid,
  email,
  full_name,
  subscription_tier,
  created_at
FROM users 
WHERE email = 'site4people@gmail.com';

-- 2. Проверка данных в таблице psychologists
SELECT 
  id,
  user_id,
  email,
  full_name,
  role,
  active,
  created_at
FROM psychologists 
WHERE email = 'site4people@gmail.com';

-- 3. Проверка связи между users и psychologists
SELECT 
  u.id as user_id,
  u.sso_uid,
  u.email,
  u.subscription_tier,
  p.id as psychologist_id,
  p.user_id as psychologist_user_id,
  p.role as psychologist_role,
  p.active as psychologist_active,
  CASE 
    WHEN p.active = true AND p.role = 'admin' THEN 'admin'
    ELSE u.subscription_tier
  END as effective_role
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'site4people@gmail.com';

-- 4. Проверка auth.users (для получения правильного auth.uid)
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'site4people@gmail.com';

