-- CORRECT FIX for audio_entries RLS policies
-- Key insight: audio_entries.user_id references auth.users(id) DIRECTLY
-- This is different from daily_entries.user_id which references public.users(id)

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.user_owns_audio_entry(UUID);

-- Create a new helper function that works with auth.users(id) directly
CREATE OR REPLACE FUNCTION public.user_owns_audio_entry(entry_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_auth_uid UUID;
BEGIN
  -- Get the current authenticated user's ID (returns UUID or NULL)
  current_auth_uid := auth.uid();
  
  -- If no authenticated user, return false
  IF current_auth_uid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Since audio_entries.user_id references auth.users(id) directly,
  -- we just need to check if the current auth user matches the entry's user_id
  RETURN current_auth_uid = entry_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_owns_audio_entry(UUID) TO authenticated;

-- Create new policies using the function
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

-- Add comment
COMMENT ON FUNCTION public.user_owns_audio_entry(UUID) IS 'Check if the current authenticated user owns the audio entry. audio_entries.user_id references auth.users(id) directly.';

