-- =============================================================================
-- ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ КАК АДМИНА
-- =============================================================================
-- Этот скрипт добавит вас в таблицу psychologists как админа
-- =============================================================================

-- ШАГ 1: Найти ваш sso_uid
-- =============================================================================
DO $$
DECLARE
  admin_email TEXT := 'site4people@gmail.com'; -- ВАШ EMAIL
  user_sso_uid TEXT;
  user_full_name TEXT;
  existing_psych_id UUID;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== ДОБАВЛЕНИЕ АДМИНА ===';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE '';
  
  -- Найти пользователя
  SELECT sso_uid, full_name INTO user_sso_uid, user_full_name
  FROM users
  WHERE email = admin_email
  LIMIT 1;
  
  IF user_sso_uid IS NULL THEN
    RAISE NOTICE '❌ ОШИБКА: Пользователь с email % не найден!', admin_email;
    RAISE NOTICE 'Сначала зарегистрируйтесь в приложении.';
    RETURN;
  END IF;
  
  RAISE NOTICE '✓ Пользователь найден';
  RAISE NOTICE '  - sso_uid: %', user_sso_uid;
  RAISE NOTICE '  - full_name: %', COALESCE(user_full_name, 'не указано');
  RAISE NOTICE '';
  
  -- Проверить, есть ли уже в psychologists
  SELECT id INTO existing_psych_id
  FROM psychologists
  WHERE user_id = user_sso_uid
  LIMIT 1;
  
  IF existing_psych_id IS NOT NULL THEN
    RAISE NOTICE 'Запись в psychologists уже существует, обновляем...';
    
    UPDATE psychologists
    SET 
      role = 'admin',
      active = true,
      updated_at = NOW()
    WHERE user_id = user_sso_uid;
    
    RAISE NOTICE '✅ Запись обновлена! Роль установлена: admin, active: true';
  ELSE
    RAISE NOTICE 'Добавляем новую запись в psychologists...';
    
    INSERT INTO psychologists (
      user_id,
      email,
      full_name,
      role,
      active,
      created_at,
      updated_at
    ) VALUES (
      user_sso_uid,
      admin_email,
      COALESCE(user_full_name, 'Admin'),
      'admin',
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Новая запись создана! Роль: admin, active: true';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== ПРОВЕРКА РЕЗУЛЬТАТА ===';
  
END $$;

-- ШАГ 2: Проверка результата
-- =============================================================================
SELECT 
  p.id,
  p.user_id as "SSO UID",
  p.email as "Email",
  p.full_name as "Имя",
  p.role as "Роль",
  p.active as "Активен",
  p.created_at as "Создан",
  p.updated_at as "Обновлен"
FROM psychologists p
WHERE p.email = 'site4people@gmail.com'; -- ВАШ EMAIL

-- ШАГ 3: Проверка связи с users
-- =============================================================================
SELECT 
  u.id as "User ID",
  u.email as "Email",
  u.sso_uid as "SSO UID",
  u.full_name as "Имя",
  u.subscription_tier as "Подписка",
  p.role as "Роль в psychologists",
  p.active as "Активен"
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'site4people@gmail.com' -- ВАШ EMAIL
LIMIT 1;

-- =============================================================================
-- ГОТОВО!
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== ЗАВЕРШЕНО ===';
  RAISE NOTICE 'Проверьте результаты выше.';
  RAISE NOTICE 'Если видите роль "admin" и active = true, то все готово!';
  RAISE NOTICE '';
  RAISE NOTICE 'СЛЕДУЮЩИЕ ШАГИ:';
  RAISE NOTICE '1. Обновите страницу админ-панели (F5)';
  RAISE NOTICE '2. Попробуйте запустить анализ снова';
  RAISE NOTICE '3. Если не работает - проверьте консоль браузера (F12)';
  RAISE NOTICE '';
END $$;

