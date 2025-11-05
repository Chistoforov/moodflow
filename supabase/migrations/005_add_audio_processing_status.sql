-- Add processing_status field to daily_entries for tracking audio transcription
ALTER TABLE public.daily_entries 
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT NULL CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- Add index for faster queries on processing status
CREATE INDEX IF NOT EXISTS idx_daily_entries_processing_status 
ON public.daily_entries(processing_status) 
WHERE processing_status IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.daily_entries.processing_status IS 'Status of audio transcription: pending, processing, completed, failed';


