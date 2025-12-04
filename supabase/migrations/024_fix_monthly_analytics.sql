-- Drop existing objects if they have issues and recreate
-- This is a safe migration that checks for existence

-- Drop indexes if they exist (to recreate them properly)
DROP INDEX IF EXISTS public.idx_monthly_analytics_user_date;
DROP INDEX IF EXISTS public.idx_monthly_analytics_final;

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.monthly_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Month identification
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  -- Week tracking
  week_number INTEGER NOT NULL, -- 1, 2, 3, 4
  days_analyzed INTEGER NOT NULL, -- 7, 14, 21, 28+
  
  -- Analysis data
  analysis_text TEXT NOT NULL,
  general_impression TEXT,
  positive_trends TEXT,
  decline_reasons TEXT,
  recommendations TEXT,
  reflection_directions TEXT,
  
  -- Perplexity metadata
  perplexity_request_id TEXT,
  perplexity_response JSONB,
  
  -- Status
  is_final BOOLEAN DEFAULT false, -- true for last day of month
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing unique constraint if exists
ALTER TABLE public.monthly_analytics 
  DROP CONSTRAINT IF EXISTS monthly_analytics_user_id_year_month_week_number_key;

-- Add unique constraint
ALTER TABLE public.monthly_analytics
  ADD CONSTRAINT monthly_analytics_user_id_year_month_week_number_key 
  UNIQUE(user_id, year, month, week_number);

-- Create indexes
CREATE INDEX idx_monthly_analytics_user_date ON public.monthly_analytics(user_id, year, month);
CREATE INDEX idx_monthly_analytics_final ON public.monthly_analytics(user_id, year, month, is_final) WHERE is_final = true;

-- Enable RLS
ALTER TABLE public.monthly_analytics ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'monthly_analytics' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.monthly_analytics';
    END LOOP;
END $$;

-- Policy: Users can read their own analytics
CREATE POLICY "Users can read their own monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert/update analytics
CREATE POLICY "Service role can manage monthly analytics"
  ON public.monthly_analytics
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Authenticated users can insert their own analytics (for API calls)
CREATE POLICY "Users can insert their own monthly analytics"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin policy: Admins can read all analytics
CREATE POLICY "Admins can read all monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
      AND active = true
    )
  );

-- Admin policy: Admins can update all analytics
CREATE POLICY "Admins can update all monthly analytics"
  ON public.monthly_analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
      AND active = true
    )
  );

-- Admin policy: Admins can insert analytics for any user
CREATE POLICY "Admins can insert monthly analytics for any user"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
      AND active = true
    )
  );

-- Drop function if exists
DROP FUNCTION IF EXISTS update_monthly_analytics_updated_at() CASCADE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monthly_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_monthly_analytics_updated_at ON public.monthly_analytics;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_monthly_analytics_updated_at
  BEFORE UPDATE ON public.monthly_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_analytics_updated_at();

