-- =============================================================================
-- ПРОВЕРКА RLS ПОЛИТИК ДЛЯ АДМИНА
-- =============================================================================
-- Выполните этот скрипт для диагностики политик
-- =============================================================================

-- ШАГ 1: Список всех политик для users (короткий вид)
-- =============================================================================
SELECT 
  policyname as "Название политики",
  cmd as "Команда"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;

-- ШАГ 2: Детальный вид политики для админов (SELECT)
-- =============================================================================
SELECT 
  policyname as "Политика",
  cmd as "Команда",
  roles as "Роли",
  -- Форматируем qual для лучшей читаемости
  CASE 
    WHEN length(qual::text) > 100 THEN 
      substring(qual::text, 1, 100) || '...'
    ELSE 
      qual::text
  END as "Условие (начало)"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
  AND policyname = 'Admins can view all users';

-- ШАГ 3: Проверка политик для monthly_analytics
-- =============================================================================
SELECT 
  policyname as "Название политики",
  cmd as "Команда"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'monthly_analytics'
ORDER BY policyname;

-- ШАГ 4: ГЛАВНАЯ ПРОВЕРКА - Проверка вашего админского доступа
-- =============================================================================
-- ЗАМЕНИТЕ 'site4people@gmail.com' НА ВАШ EMAIL!
-- =============================================================================

DO $$
DECLARE
  admin_email TEXT := 'site4people@gmail.com'; -- ИЗМЕНИТЕ ЭТО!
  user_record RECORD;
  psych_record RECORD;
  test_passed BOOLEAN := true;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== ПРОВЕРКА АДМИНСКОГО ДОСТУПА ===';
  RAISE NOTICE 'Email для проверки: %', admin_email;
  RAISE NOTICE '';
  
  -- Проверка 1: Есть ли пользователь в users
  SELECT * INTO user_record
  FROM users
  WHERE email = admin_email
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE '❌ ОШИБКА: Пользователь с email % не найден в таблице users!', admin_email;
    test_passed := false;
  ELSE
    RAISE NOTICE '✓ Пользователь найден в users';
    RAISE NOTICE '  - id: %', user_record.id;
    RAISE NOTICE '  - sso_uid: %', user_record.sso_uid;
    RAISE NOTICE '';
    
    -- Проверка 2: Есть ли запись в psychologists
    SELECT * INTO psych_record
    FROM psychologists
    WHERE user_id = user_record.sso_uid
    LIMIT 1;
    
    IF NOT FOUND THEN
      RAISE NOTICE '❌ ОШИБКА: Пользователь НЕ найден в таблице psychologists!';
      RAISE NOTICE '   Нужно добавить запись в psychologists';
      RAISE NOTICE '';
      RAISE NOTICE '   Выполните:';
      RAISE NOTICE '   INSERT INTO psychologists (user_id, email, full_name, role, active)';
      RAISE NOTICE '   VALUES (''%'', ''%'', ''Ваше Имя'', ''admin'', true);',
        user_record.sso_uid, admin_email;
      test_passed := false;
    ELSE
      RAISE NOTICE '✓ Запись найдена в psychologists';
      RAISE NOTICE '  - role: %', psych_record.role;
      RAISE NOTICE '  - active: %', psych_record.active;
      RAISE NOTICE '';
      
      -- Проверка 3: Правильная роль и активность
      IF psych_record.role != 'admin' THEN
        RAISE NOTICE '❌ ОШИБКА: Роль не admin (текущая: %)', psych_record.role;
        test_passed := false;
      ELSIF NOT psych_record.active THEN
        RAISE NOTICE '❌ ОШИБКА: Аккаунт неактивен (active = false)';
        test_passed := false;
      ELSE
        RAISE NOTICE '✓ Роль admin и аккаунт активен';
      END IF;
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== ИТОГ ===';
  IF test_passed THEN
    RAISE NOTICE '✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!';
    RAISE NOTICE 'Админский доступ должен работать.';
    RAISE NOTICE '';
    RAISE NOTICE 'Если анализ все еще не работает:';
    RAISE NOTICE '1. Обновите страницу админ-панели (F5)';
    RAISE NOTICE '2. Проверьте консоль браузера (F12) на ошибки';
    RAISE NOTICE '3. Проверьте переменные окружения NEXT_PUBLIC_SUPABASE_* в Vercel';
  ELSE
    RAISE NOTICE '❌ ЕСТЬ ПРОБЛЕМЫ!';
    RAISE NOTICE 'Смотрите сообщения выше для их исправления.';
  END IF;
  RAISE NOTICE '';
END $$;

-- ШАГ 5: Подсчет политик (должно быть минимум 4 для users)
-- =============================================================================
SELECT 
  tablename as "Таблица",
  count(*) as "Количество политик"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'monthly_analytics')
GROUP BY tablename
ORDER BY tablename;

-- ШАГ 6: Проверка, что RLS включен
-- =============================================================================
SELECT 
  tablename as "Таблица",
  rowsecurity as "RLS включен"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'monthly_analytics', 'daily_entries', 'psychologists')
ORDER BY tablename;

