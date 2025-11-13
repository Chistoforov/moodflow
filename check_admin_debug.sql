-- Check admin user setup
-- Run this in Supabase SQL Editor

-- 1. Check auth.users
SELECT 'Auth Users' as table_name, id, email, created_at
FROM auth.users
WHERE email = 'site4people@gmail.com';

-- 2. Check public.users
SELECT 'Public Users' as table_name, sso_uid, email, created_at
FROM public.users
WHERE email = 'site4people@gmail.com';

-- 3. Check psychologists
SELECT 'Psychologists' as table_name, id, user_id, email, role, active
FROM public.psychologists
WHERE email = 'site4people@gmail.com';

-- 4. Check if user_id matches
SELECT 
  'User ID Match Check' as check_name,
  u.sso_uid as users_sso_uid,
  p.user_id as psychologists_user_id,
  CASE 
    WHEN u.sso_uid = p.user_id THEN 'MATCH ✓'
    ELSE 'NO MATCH ✗'
  END as match_status
FROM public.users u
LEFT JOIN public.psychologists p ON p.email = u.email
WHERE u.email = 'site4people@gmail.com';

