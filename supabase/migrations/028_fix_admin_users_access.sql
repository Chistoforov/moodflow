-- Migration: Fix admin access to users table for analytics
-- Description: Ensure admins can SELECT all users for analytics purposes

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Recreate admin SELECT policy with proper auth.uid() checking
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    -- Allow users to see their own data
    auth.uid()::text = sso_uid
    OR
    -- Allow admins to see all users
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Recreate admin UPDATE policy
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    -- Allow users to update their own data
    auth.uid()::text = sso_uid
    OR
    -- Allow admins to update all users
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Also ensure monthly_analytics table has proper admin access
DROP POLICY IF EXISTS "Admins can insert monthly analytics for any user" ON monthly_analytics;
DROP POLICY IF EXISTS "Admins can view all monthly analytics" ON monthly_analytics;

-- Allow admins to insert analytics for any user
CREATE POLICY "Admins can insert monthly analytics for any user" ON monthly_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Allow admins to view all analytics
CREATE POLICY "Admins can view all monthly analytics" ON monthly_analytics
  FOR SELECT USING (
    -- Users can see their own analytics
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = monthly_analytics.user_id
      AND u.sso_uid = auth.uid()::text
    )
    OR
    -- Admins can see all analytics
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

