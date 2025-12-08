-- Fix RLS policies for audio_entries using the same approach as daily_entries
-- The key difference: check through users table and sso_uid instead of direct auth.uid()
-- This works because daily_entries uses the same approach and it works!

-- Drop and recreate the helper function to check through users table
CREATE OR REPLACE FUNCTION public.user_owns_audio_entry(entry_user_id UUID)
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
  -- audio_entries.user_id references auth.users(id) directly
  -- users.sso_uid also references auth.users(id)
  -- So we check: is there a user where sso_uid = current_auth_uid AND sso_uid = entry_user_id?
  -- This is the same pattern as daily_entries, but checking sso_uid directly
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE sso_uid = current_auth_uid
    AND sso_uid = entry_user_id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.user_owns_audio_entry(UUID) TO authenticated;

-- Drop existing policies for audio_entries
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

-- Recreate policies for audio_entries using the helper function
CREATE POLICY "Users can view their own audio entries"
ON public.audio_entries FOR SELECT
TO authenticated
USING (public.user_owns_audio_entry(user_id));

CREATE POLICY "Users can insert their own audio entries"
ON public.audio_entries FOR INSERT
TO authenticated
WITH CHECK (public.user_owns_audio_entry(user_id));

CREATE POLICY "Users can update their own audio entries"
ON public.audio_entries FOR UPDATE
TO authenticated
USING (public.user_owns_audio_entry(user_id))
WITH CHECK (public.user_owns_audio_entry(user_id));

CREATE POLICY "Users can delete their own audio entries"
ON public.audio_entries FOR DELETE
TO authenticated
USING (public.user_owns_audio_entry(user_id));

