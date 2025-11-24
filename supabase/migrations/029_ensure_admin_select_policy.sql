-- Ensure admins can read all monthly analytics
-- This migration explicitly drops and recreates the policy to ensure it exists and is correct

DROP POLICY IF EXISTS "Admins can read all monthly analytics" ON public.monthly_analytics;

CREATE POLICY "Admins can read all monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON p.user_id = u.sso_uid
      WHERE u.sso_uid = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );
