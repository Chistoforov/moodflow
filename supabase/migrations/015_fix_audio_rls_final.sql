-- FINAL FIX for audio_entries RLS policies
-- This uses the exact same approach as daily_entries which works correctly

-- IMPORTANT: Drop policies FIRST before dropping the function they depend on
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

-- Now we can drop the function
DROP FUNCTION IF EXISTS public.user_owns_audio_entry(UUID);

-- Create the helper function with correct logic
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
  -- users.sso_uid also references auth.users(id) (stored as text)
  -- So we check: does a user exist where sso_uid matches both the current auth user AND the entry's user_id
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE sso_uid = current_auth_uid::text
    AND sso_uid = entry_user_id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.user_owns_audio_entry(UUID) TO authenticated;

-- Recreate policies for audio_entries using the helper function
-- This matches the exact pattern used for daily_entries
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
COMMENT ON FUNCTION public.user_owns_audio_entry(UUID) IS 'Check if the current authenticated user owns the audio entry. Uses the same pattern as daily_entries.';

