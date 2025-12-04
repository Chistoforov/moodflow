-- Проверка политик для таблицы monthly_analytics
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'monthly_analytics' 
AND schemaname = 'public'
ORDER BY policyname;

-- Проверка, есть ли политика для админов
SELECT COUNT(*) as admin_policies_count
FROM pg_policies 
WHERE tablename = 'monthly_analytics' 
AND schemaname = 'public'
AND policyname LIKE '%Admin%';

-- Проверка структуры таблицы psychologists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'psychologists'
ORDER BY ordinal_position;

-- Проверка данных аналитики для конкретного пользователя (замените USER_ID на нужный)
-- SELECT * FROM monthly_analytics WHERE user_id = 'YOUR_USER_ID_HERE';

-- Проверка текущего пользователя и его роли админа
SELECT 
  p.user_id,
  p.email,
  p.role,
  p.active,
  auth.uid() as current_auth_uid
FROM psychologists p
WHERE p.user_id = auth.uid()::text;
