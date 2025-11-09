-- Alternative fix: Use simpler RLS policies that check JWT claims directly
-- This approach doesn't rely on auth.uid() which may not work in server context

-- Drop existing policies for audio_entries
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

-- Drop the function if it exists (we'll use simpler approach)
DROP FUNCTION IF EXISTS public.user_owns_audio_entry(UUID);

-- Create a simpler helper function that reads from JWT claims
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
DECLARE
  jwt_user_id UUID;
  auth_uid UUID;
BEGIN
  -- Try JWT claims first
  BEGIN
    jwt_user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
  EXCEPTION WHEN OTHERS THEN
    jwt_user_id := NULL;
  END;
  
  -- Fallback to auth.uid()
  auth_uid := auth.uid();
  
  -- Return whichever is available
  RETURN COALESCE(jwt_user_id, auth_uid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;

-- Recreate policies using the simpler function
CREATE POLICY "Users can view their own audio entries"
ON public.audio_entries FOR SELECT
TO authenticated
USING (public.get_current_user_id() = user_id);

CREATE POLICY "Users can insert their own audio entries"
ON public.audio_entries FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_id() = user_id);

CREATE POLICY "Users can update their own audio entries"
ON public.audio_entries FOR UPDATE
TO authenticated
USING (public.get_current_user_id() = user_id)
WITH CHECK (public.get_current_user_id() = user_id);

CREATE POLICY "Users can delete their own audio entries"
ON public.audio_entries FOR DELETE
TO authenticated
USING (public.get_current_user_id() = user_id);




