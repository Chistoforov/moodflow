-- Add RLS policy to allow admins to view all users
-- This is needed for the admin panel users list

-- First, let's add a policy that allows admins (from psychologists table) to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Also add a policy to allow admins to update any user (for role changes)
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

