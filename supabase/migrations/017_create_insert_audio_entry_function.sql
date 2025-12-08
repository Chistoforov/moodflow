-- Alternative approach: Use RPC function to insert audio entries
-- This bypasses RLS issues by using SECURITY DEFINER and checking auth.uid() explicitly

CREATE OR REPLACE FUNCTION public.insert_audio_entry(
  p_entry_date DATE,
  p_audio_url TEXT,
  p_audio_duration INTEGER,
  p_processing_status TEXT DEFAULT 'pending'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  entry_date DATE,
  audio_url TEXT,
  audio_duration INTEGER,
  transcript TEXT,
  processing_status TEXT,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result RECORD;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
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
    v_user_id,
    p_entry_date,
    p_audio_url,
    p_audio_duration,
    p_processing_status,
    FALSE
  )
  RETURNING * INTO v_result;
  
  -- Return the inserted row
  RETURN QUERY SELECT
    v_result.id,
    v_result.user_id,
    v_result.entry_date,
    v_result.audio_url,
    v_result.audio_duration,
    v_result.transcript,
    v_result.processing_status,
    v_result.is_deleted,
    v_result.created_at,
    v_result.updated_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_audio_entry(DATE, TEXT, INTEGER, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.insert_audio_entry IS 'Insert a new audio entry for the authenticated user. Bypasses RLS by using SECURITY DEFINER.';

