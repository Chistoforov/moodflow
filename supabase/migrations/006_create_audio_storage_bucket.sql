-- Create storage bucket for audio entries
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-entries',
  'audio-entries',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own audio files
CREATE POLICY "Users can upload own audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-entries' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own audio files
CREATE POLICY "Users can read own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-entries' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Public can read audio files (for public URLs)
CREATE POLICY "Public can read audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-entries');

-- Policy: Users can delete their own audio files
CREATE POLICY "Users can delete own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-entries' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own audio files
CREATE POLICY "Users can update own audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-entries' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


