-- REBUILD audio_entries from scratch
-- Goal: Make it exactly like daily_entries (which works!)
-- Key change: user_id should reference public.users(id) instead of auth.users(id)

-- Step 1: Drop all existing policies and functions
DROP POLICY IF EXISTS "Users can view their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can insert their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can update their own audio entries" ON audio_entries;
DROP POLICY IF EXISTS "Users can delete their own audio entries" ON audio_entries;

DROP FUNCTION IF EXISTS public.user_owns_audio_entry(UUID);
DROP FUNCTION IF EXISTS public.insert_audio_entry(UUID, DATE, TEXT, INTEGER, TEXT);

-- Step 2: Backup existing data (if any)
CREATE TABLE IF NOT EXISTS audio_entries_backup AS SELECT * FROM audio_entries;

-- Step 3: Drop and recreate audio_entries table with correct structure
DROP TABLE IF EXISTS audio_entries;

CREATE TABLE audio_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,  -- Changed: now references public.users
  entry_date DATE NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration INTEGER,
  transcript TEXT,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 4: Create indexes
CREATE INDEX idx_audio_entries_user_date ON audio_entries(user_id, entry_date) WHERE is_deleted = FALSE;
CREATE INDEX idx_audio_entries_processing_status ON audio_entries(processing_status) WHERE processing_status IS NOT NULL AND is_deleted = FALSE;

-- Step 5: Enable RLS
ALTER TABLE audio_entries ENABLE ROW LEVEL SECURITY;

-- Step 6: Create helper function (same pattern as daily_entries)
CREATE OR REPLACE FUNCTION public.user_owns_audio_entry(entry_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_auth_uid TEXT;
BEGIN
  current_auth_uid := auth.uid()::text;
  
  IF current_auth_uid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check through public.users table (same as daily_entries)
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = entry_user_id
    AND sso_uid = current_auth_uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.user_owns_audio_entry(UUID) TO authenticated;

-- Step 7: Create RLS policies (exactly like daily_entries)
CREATE POLICY "Users can view their own audio entries"
ON audio_entries FOR SELECT
TO authenticated
USING (public.user_owns_audio_entry(user_id));

CREATE POLICY "Users can insert their own audio entries"
ON audio_entries FOR INSERT
TO authenticated
WITH CHECK (public.user_owns_audio_entry(user_id));

CREATE POLICY "Users can update their own audio entries"
ON audio_entries FOR UPDATE
TO authenticated
USING (public.user_owns_audio_entry(user_id))
WITH CHECK (public.user_owns_audio_entry(user_id));

CREATE POLICY "Users can delete their own audio entries"
ON audio_entries FOR DELETE
TO authenticated
USING (public.user_owns_audio_entry(user_id));

-- Step 8: Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_audio_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_audio_entries_updated ON audio_entries;
CREATE TRIGGER on_audio_entries_updated
  BEFORE UPDATE ON audio_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_audio_entries_updated_at();

-- Step 9: Restore data if backup exists (convert auth.users.id to public.users.id)
-- Note: This assumes users.sso_uid = auth.users.id
INSERT INTO audio_entries (id, user_id, entry_date, audio_url, audio_duration, transcript, processing_status, is_deleted, created_at, updated_at)
SELECT 
  b.id,
  u.id as user_id,  -- Convert from auth.users.id to public.users.id
  b.entry_date,
  b.audio_url,
  b.audio_duration,
  b.transcript,
  b.processing_status,
  b.is_deleted,
  b.created_at,
  b.updated_at
FROM audio_entries_backup b
JOIN public.users u ON u.sso_uid = b.user_id::text
WHERE EXISTS (SELECT 1 FROM audio_entries_backup)
ON CONFLICT (id) DO NOTHING;

-- Clean up backup table
DROP TABLE IF EXISTS audio_entries_backup;

-- Add comment
COMMENT ON TABLE audio_entries IS 'Audio entries for daily diary - rebuilt to match daily_entries structure';
COMMENT ON FUNCTION public.user_owns_audio_entry(UUID) IS 'Check audio entry ownership - same pattern as daily_entries';

