-- Migration: Add admin policy for daily_entries
-- Description: Allow admins to view all daily entries from all users

-- Drop existing psychologist policy to recreate it with better name
DROP POLICY IF EXISTS "Psychologists can view subscribed entries" ON daily_entries;

-- Recreate psychologist policy with clearer name
CREATE POLICY "Psychologists can view subscribed users entries" ON daily_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.id = daily_entries.user_id
      WHERE p.user_id = auth.uid()::text
      AND u.subscription_tier IN ('subscription', 'personal')
      AND p.active = true
    )
  );

-- Add admin policy to view all entries
CREATE POLICY "Admins can view all entries" ON daily_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Add admin policy to update entries (for potential moderation)
CREATE POLICY "Admins can update all entries" ON daily_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

-- Add admin policy to delete entries (for potential moderation)
CREATE POLICY "Admins can delete all entries" ON daily_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

