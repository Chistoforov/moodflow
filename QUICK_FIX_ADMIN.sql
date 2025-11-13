-- QUICK FIX: Update admin user_id to match sso_uid
-- Run this in Supabase SQL Editor NOW

-- Step 1: Check current state
SELECT 
  'BEFORE FIX' as stage,
  u.sso_uid as correct_user_id,
  p.user_id as current_user_id,
  p.email,
  p.role,
  p.active,
  CASE 
    WHEN u.sso_uid = p.user_id THEN '✓ Already Fixed'
    ELSE '✗ Needs Fix'
  END as status
FROM public.users u
LEFT JOIN public.psychologists p ON p.email = u.email
WHERE u.email = 'site4people@gmail.com';

-- Step 2: Fix the user_id
UPDATE public.psychologists 
SET 
  user_id = (SELECT sso_uid FROM public.users WHERE email = 'site4people@gmail.com' LIMIT 1),
  role = 'admin',
  active = true
WHERE email = 'site4people@gmail.com';

-- Step 3: Verify fix
SELECT 
  'AFTER FIX' as stage,
  u.sso_uid as correct_user_id,
  p.user_id as current_user_id,
  p.id as psychologist_id,
  p.email,
  p.role,
  p.active,
  CASE 
    WHEN u.sso_uid = p.user_id THEN '✓ Fixed!'
    ELSE '✗ Still Wrong'
  END as status
FROM public.users u
INNER JOIN public.psychologists p ON p.email = u.email
WHERE u.email = 'site4people@gmail.com';

-- Step 4: Test that psychologist has correct permissions for posts table
SELECT 
  'PERMISSIONS CHECK' as test,
  id as psychologist_id,
  email,
  role,
  'Can create posts with this author_id' as note
FROM public.psychologists
WHERE email = 'site4people@gmail.com';

