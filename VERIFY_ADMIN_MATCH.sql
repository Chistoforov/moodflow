-- =============================================================================
-- ПРОВЕРКА СООТВЕТСТВИЯ SSO_UID
-- =============================================================================
-- Этот скрипт проверяет, что все связи настроены правильно
-- =============================================================================

-- ВАЖНАЯ ПРОВЕРКА: Соответствие users.sso_uid и psychologists.user_id
-- =============================================================================
SELECT 
  '=== ПРОВЕРКА СООТВЕТСТВИЯ ===' as "Информация";

SELECT 
  u.email as "Email",
  u.sso_uid as "users.sso_uid",
  p.user_id as "psychologists.user_id",
  CASE 
    WHEN u.sso_uid = p.user_id THEN '✅ СОВПАДАЮТ'
    ELSE '❌ НЕ СОВПАДАЮТ!'
  END as "Статус соответствия",
  p.role as "Роль",
  p.active as "Активен"
FROM users u
FULL OUTER JOIN psychologists p ON p.email = u.email
WHERE u.email = 'site4people@gmail.com' OR p.email = 'site4people@gmail.com';

-- Детальная информация
-- =============================================================================
SELECT 
  '=== ДЕТАЛИ ПОЛЬЗОВАТЕЛЯ ===' as "Информация";

-- Из таблицы users
SELECT 
  'users' as "Таблица",
  id as "ID",
  email as "Email", 
  sso_uid as "SSO UID",
  full_name as "Имя",
  subscription_tier as "Подписка",
  created_at as "Создан"
FROM users
WHERE email = 'site4people@gmail.com';

SELECT 
  '---' as "---";

-- Из таблицы psychologists  
SELECT 
  'psychologists' as "Таблица",
  id as "ID",
  email as "Email",
  user_id as "User ID (должен = sso_uid)",
  full_name as "Имя",
  role as "Роль",
  active as "Активен",
  created_at as "Создан"
FROM psychologists
WHERE email = 'site4people@gmail.com';

-- ИТОГОВАЯ ПРОВЕРКА
-- =============================================================================
DO $$
DECLARE
  user_sso TEXT;
  psych_user_id TEXT;
  psych_role TEXT;
  psych_active BOOLEAN;
  all_good BOOLEAN := true;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== ИТОГОВАЯ ПРОВЕРКА ===';
  
  -- Получить данные
  SELECT u.sso_uid, p.user_id, p.role, p.active
  INTO user_sso, psych_user_id, psych_role, psych_active
  FROM users u
  LEFT JOIN psychologists p ON p.email = u.email
  WHERE u.email = 'site4people@gmail.com'
  LIMIT 1;
  
  -- Проверки
  IF user_sso IS NULL THEN
    RAISE NOTICE '❌ Пользователь не найден в таблице users!';
    all_good := false;
  ELSE
    RAISE NOTICE '✓ Пользователь найден в users';
    RAISE NOTICE '  sso_uid: %', user_sso;
  END IF;
  
  IF psych_user_id IS NULL THEN
    RAISE NOTICE '❌ Пользователь не найден в таблице psychologists!';
    all_good := false;
  ELSE
    RAISE NOTICE '✓ Пользователь найден в psychologists';
    RAISE NOTICE '  user_id: %', psych_user_id;
    
    IF user_sso = psych_user_id THEN
      RAISE NOTICE '✓ SSO UID совпадают!';
    ELSE
      RAISE NOTICE '❌ SSO UID НЕ совпадают!';
      RAISE NOTICE '  users.sso_uid: %', user_sso;
      RAISE NOTICE '  psychologists.user_id: %', psych_user_id;
      all_good := false;
    END IF;
    
    IF psych_role = 'admin' THEN
      RAISE NOTICE '✓ Роль: admin';
    ELSE
      RAISE NOTICE '❌ Роль не admin: %', psych_role;
      all_good := false;
    END IF;
    
    IF psych_active THEN
      RAISE NOTICE '✓ Активен: true';
    ELSE
      RAISE NOTICE '❌ Неактивен: false';
      all_good := false;
    END IF;
  END IF;
  
  RAISE NOTICE '';
  IF all_good THEN
    RAISE NOTICE '✅✅✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! ✅✅✅';
    RAISE NOTICE '';
    RAISE NOTICE 'База данных настроена правильно.';
    RAISE NOTICE 'Теперь проверьте в приложении:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Выйдите из аккаунта (logout)';
    RAISE NOTICE '2. Войдите снова (login)';
    RAISE NOTICE '3. Перейдите на /admin/users';
    RAISE NOTICE '4. Попробуйте запустить анализ';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '❌ ЕСТЬ ПРОБЛЕМЫ - см. выше';
  END IF;
END $$;

