-- URGENT FIX: Admin cannot view analytics in admin panel
-- Problem: Admin policies for monthly_analytics were not joining with users table correctly
-- Solution: Use the same pattern as posts table policies

-- STEP 1: Drop ALL existing policies for monthly_analytics
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'monthly_analytics' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.monthly_analytics';
    END LOOP;
END $$;

-- STEP 2: Create user policies
-- Policy: Users can read their own analytics
CREATE POLICY "Users can read their own monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all analytics
CREATE POLICY "Service role can manage monthly analytics"
  ON public.monthly_analytics
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Users can insert their own analytics
CREATE POLICY "Users can insert their own monthly analytics"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own analytics
CREATE POLICY "Users can update their own monthly analytics"
  ON public.monthly_analytics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- STEP 3: Create CORRECT admin policies (using JOIN with users table)
-- Admin policy: Admins can read all analytics
CREATE POLICY "Admins can read all monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

-- Admin policy: Admins can update all analytics
CREATE POLICY "Admins can update all monthly analytics"
  ON public.monthly_analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

-- Admin policy: Admins can insert analytics for any user
CREATE POLICY "Admins can insert monthly analytics for any user"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

-- STEP 4: Verify the policies were created
SELECT 
  'Policy Check' as check_name,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✓ Policies created successfully'
    ELSE '✗ Not all policies created'
  END as status
FROM pg_policies
WHERE tablename = 'monthly_analytics'
AND schemaname = 'public';

-- STEP 5: Test admin access
SELECT 
  'Admin Access Test' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    ) THEN '✓ Admin access granted'
    ELSE '✗ Admin access denied'
  END as result;

-- STEP 6: Show sample analytics data
SELECT 
  ma.id,
  ma.user_id,
  u.email as user_email,
  ma.year,
  ma.month,
  ma.week_number,
  ma.is_final,
  ma.created_at
FROM monthly_analytics ma
JOIN auth.users u ON u.id = ma.user_id
ORDER BY ma.created_at DESC
LIMIT 5;
