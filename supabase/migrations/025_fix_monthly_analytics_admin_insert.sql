-- Fix: Allow admins to insert monthly analytics for any user
-- Problem: The existing INSERT policy only allows users to insert their own analytics
-- Solution: Add a separate policy for admins to insert analytics for any user

-- First, update the existing policy to be more specific
DROP POLICY IF EXISTS "Users can insert their own monthly analytics" ON public.monthly_analytics;

-- Recreate the user policy with a clear name
CREATE POLICY "Users can insert their own monthly analytics"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add new policy for admins to insert analytics for any user
CREATE POLICY "Admins can insert monthly analytics for any user"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );

-- Also add policy for admins to update analytics
CREATE POLICY "Admins can update monthly analytics"
  ON public.monthly_analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );

-- Add policy for admins to delete analytics (for cleanup if needed)
CREATE POLICY "Admins can delete monthly analytics"
  ON public.monthly_analytics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );


