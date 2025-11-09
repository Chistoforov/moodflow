-- Fix RLS policies for audio_entries using SECURITY DEFINER function
-- The issue is that auth.uid() may not work correctly when queries are executed from server-side API routes

-- Create a helper function to check if user owns the audio entry
-- This function bypasses RLS by using SECURITY DEFINER
-- It needs to be accessible to authenticated users
CREATE OR REPLACE FUNCTION public.user_owns_audio_entry(entry_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_auth_uid UUID;
BEGIN
  -- Get the current authenticated user's ID
  current_auth_uid := auth.uid();
  
  -- If no authenticated user, return false
  IF current_auth_uid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the entry belongs to the current user
  -- audio_entries.user_id references auth.users(id) directly
  RETURN current_auth_uid = entry_user_id;
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




