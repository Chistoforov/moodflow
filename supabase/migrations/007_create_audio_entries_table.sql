-- Create audio_entries table for multiple audio recordings per day
CREATE TABLE IF NOT EXISTS public.audio_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration INTEGER, -- duration in seconds
  transcript TEXT,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audio_entries_user_date 
ON public.audio_entries(user_id, entry_date) 
WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_audio_entries_processing_status 
ON public.audio_entries(processing_status) 
WHERE processing_status IS NOT NULL AND is_deleted = FALSE;

-- Enable RLS
ALTER TABLE public.audio_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
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
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio entries"
ON public.audio_entries FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.audio_entries IS 'Audio entries for daily diary, allows multiple recordings per day';

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_audio_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER on_audio_entries_updated
  BEFORE UPDATE ON public.audio_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_audio_entries_updated_at();

