-- Fix: Allow admins to insert monthly analytics for any user (FIXED VERSION)
-- Problem: The existing INSERT policy only allows users to insert their own analytics
-- Solution: Add a separate policy for admins to insert analytics for any user
-- FIXED: psychologists.user_id is TEXT, need to join through users table

-- Add new policy for admins to insert analytics for any user
CREATE POLICY "Admins can insert monthly analytics for any user"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON p.user_id = u.sso_uid
      WHERE u.id = auth.uid()
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Also add policy for admins to update analytics
CREATE POLICY "Admins can update monthly analytics"
  ON public.monthly_analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON p.user_id = u.sso_uid
      WHERE u.id = auth.uid()
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Add policy for admins to delete analytics (for cleanup if needed)
CREATE POLICY "Admins can delete monthly analytics"
  ON public.monthly_analytics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON p.user_id = u.sso_uid
      WHERE u.id = auth.uid()
      AND p.role = 'admin'
      AND p.active = true
    )
  );


