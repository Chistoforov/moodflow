-- Add UPDATE policy for admins on monthly_analytics table
-- This allows admins to edit analytics data through the admin panel

DROP POLICY IF EXISTS "Admins can update all monthly analytics" ON public.monthly_analytics;

CREATE POLICY "Admins can update all monthly analytics"
  ON public.monthly_analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

