-- Fix RLS policies for audio_entries using JWT claims directly
-- The issue is that auth.uid() may return NULL in server-side API routes
-- even when the user is authenticated. We need to read from JWT claims directly.

-- Drop and recreate the helper function to use JWT claims
CREATE OR REPLACE FUNCTION public.user_owns_audio_entry(entry_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  jwt_user_id UUID;
  auth_uid UUID;
BEGIN
  -- Try to get user ID from JWT claims first (works in server context)
  BEGIN
    jwt_user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
  EXCEPTION WHEN OTHERS THEN
    jwt_user_id := NULL;
  END;
  
  -- Also try auth.uid() as fallback
  auth_uid := auth.uid();
  
  -- Use whichever is available
  IF jwt_user_id IS NOT NULL THEN
    RETURN jwt_user_id = entry_user_id;
  ELSIF auth_uid IS NOT NULL THEN
    RETURN auth_uid = entry_user_id;
  ELSE
    RETURN FALSE;
  END IF;
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

