-- Add RLS policies for posts table to allow admins to create/update/delete posts
-- Currently only SELECT policy exists, so no one can INSERT/UPDATE/DELETE

-- Policy for admins to insert posts
CREATE POLICY "Admins can insert posts" ON posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.id = author_id
        AND p.role = 'admin'
        AND p.active = true
    )
  );

-- Policy for admins to update posts
CREATE POLICY "Admins can update posts" ON posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

-- Policy for admins to delete posts
CREATE POLICY "Admins can delete posts" ON posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

-- Policy for admins to view all posts (including unpublished)
CREATE POLICY "Admins can view all posts" ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );

