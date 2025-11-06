-- Fix RLS by creating a function that inserts audio entries
-- This function uses SECURITY DEFINER to bypass RLS and validates the user_id
-- The function is called from the API route with explicit user_id

-- Create function to insert audio entry with validation
CREATE OR REPLACE FUNCTION public.insert_audio_entry(
  p_user_id UUID,
  p_entry_date DATE,
  p_audio_url TEXT,
  p_audio_duration INTEGER,
  p_processing_status TEXT DEFAULT 'pending'
)
RETURNS UUID AS $$
DECLARE
  current_auth_uid UUID;
  new_entry_id UUID;
BEGIN
  -- Get the current authenticated user's ID
  current_auth_uid := auth.uid();
  
  -- If no authenticated user, raise error
  IF current_auth_uid IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Verify that the user_id matches the authenticated user
  IF current_auth_uid != p_user_id THEN
    RAISE EXCEPTION 'User ID mismatch: cannot insert entry for another user';
  END IF;
  
  -- Insert the audio entry
  INSERT INTO public.audio_entries (
    user_id,
    entry_date,
    audio_url,
    audio_duration,
    processing_status,
    is_deleted
  ) VALUES (
    p_user_id,
    p_entry_date,
    p_audio_url,
    p_audio_duration,
    p_processing_status,
    FALSE
  ) RETURNING id INTO new_entry_id;
  
  RETURN new_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_audio_entry(UUID, DATE, TEXT, INTEGER, TEXT) TO authenticated;

-- Now update RLS policies to allow SELECT, UPDATE, DELETE but not INSERT
-- INSERT will be done through the function
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

-- Recreate policies (without INSERT policy, as we use function for that)
CREATE POLICY "Users can view their own audio entries"
ON public.audio_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- No INSERT policy needed - we use the function instead

CREATE POLICY "Users can update their own audio entries"
ON public.audio_entries FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio entries"
ON public.audio_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

