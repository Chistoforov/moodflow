-- Fix RLS policies for audio_entries using direct auth.uid() check
-- This is the simplest approach that should work with SSR client
-- The key is to ensure the session is properly passed to the database

-- Drop existing policies for audio_entries
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

-- Drop the function if it exists (we'll use simpler approach)
DROP FUNCTION IF EXISTS public.user_owns_audio_entry(UUID);
DROP FUNCTION IF EXISTS public.get_current_user_id();

-- Use the simplest possible RLS policies
-- These should work if the session is properly passed from SSR client
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




