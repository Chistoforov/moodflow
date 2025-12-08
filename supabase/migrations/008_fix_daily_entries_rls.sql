-- Fix RLS policies for daily_entries and audio_entries
-- The issue is that subqueries in RLS policies may not work correctly when the referenced table (users) also has RLS enabled

-- First, drop existing policies for daily_entries
DROP POLICY IF EXISTS "Users can view own entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON daily_entries;

-- Create a helper function to check if user owns the entry
-- This function bypasses RLS by using SECURITY DEFINER
-- It needs to be accessible to authenticated users
CREATE OR REPLACE FUNCTION public.user_owns_daily_entry(entry_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_auth_uid TEXT;
BEGIN
  -- Get the current authenticated user's ID
  current_auth_uid := auth.uid()::text;
  
  -- If no authenticated user, return false
  IF current_auth_uid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the entry belongs to the current user
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = entry_user_id
    AND sso_uid = current_auth_uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.user_owns_daily_entry(UUID) TO authenticated;

-- Recreate policies for daily_entries using the helper function
CREATE POLICY "Users can view own entries" ON daily_entries
  FOR SELECT USING (public.user_owns_daily_entry(user_id));

CREATE POLICY "Users can insert own entries" ON daily_entries
  FOR INSERT WITH CHECK (public.user_owns_daily_entry(user_id));

CREATE POLICY "Users can update own entries" ON daily_entries
  FOR UPDATE USING (public.user_owns_daily_entry(user_id));

CREATE POLICY "Users can delete own entries" ON daily_entries
  FOR DELETE USING (public.user_owns_daily_entry(user_id));

-- Fix audio_entries policies - ensure they work correctly
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

-- Recreate policies for audio_entries
-- Note: audio_entries.user_id references auth.users(id) directly, so auth.uid() should match
CREATE POLICY "Users can view their own audio entries"
ON public.audio_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio entries"
ON public.audio_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio entries"
ON public.audio_entries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio entries"
ON public.audio_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

