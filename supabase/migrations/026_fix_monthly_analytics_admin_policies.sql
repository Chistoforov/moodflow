-- Fix admin access to monthly_analytics
-- Problem: Admin policies were not working correctly because they didn't JOIN with users table
-- Solution: Use the same pattern as posts table policies (JOIN users on sso_uid)

-- Drop ALL existing policies for monthly_analytics
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'monthly_analytics' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.monthly_analytics';
    END LOOP;
END $$;

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

-- Admin policy: Admins can read all analytics (using JOIN with users table)
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

-- Admin policy: Admins can update all analytics (using JOIN with users table)
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

-- Admin policy: Admins can insert analytics for any user (using JOIN with users table)
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

-- Verify the policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'monthly_analytics'
  AND schemaname = 'public';
  
  RAISE NOTICE 'Total policies created for monthly_analytics: %', policy_count;
END $$;

