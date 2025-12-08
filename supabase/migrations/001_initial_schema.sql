-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sso_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'subscription', 'personal')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'expired')),
  subscription_end_date TIMESTAMPTZ,
  telegram_id BIGINT UNIQUE,
  telegram_username TEXT,
  stripe_customer_id TEXT UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Psychologists table
CREATE TABLE psychologists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(sso_uid) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'psychologist' CHECK (role IN ('admin', 'psychologist')),
  bio TEXT,
  specialization TEXT[],
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES psychologists(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily entries table
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  text_entry TEXT,
  audio_url TEXT,
  audio_duration INTEGER,
  transcript TEXT,
  factors TEXT[],
  summary_category TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);

-- Weekly summaries table
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary_text TEXT,
  key_themes TEXT[],
  mood_trend TEXT,
  perplexity_request_id TEXT,
  perplexity_response JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Recommendations table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  psychologist_id UUID REFERENCES psychologists(id) ON DELETE SET NULL,
  weekly_summary_id UUID REFERENCES weekly_summaries(id) ON DELETE SET NULL,
  title TEXT,
  text TEXT NOT NULL,
  recommendation_type TEXT DEFAULT 'weekly' CHECK (recommendation_type IN ('weekly', 'personal', 'ai')),
  read_status BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user ON recommendations(user_id, created_at DESC);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  psychologist_id UUID REFERENCES psychologists(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, psychologist_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'psychologist')),
  message_text TEXT NOT NULL,
  read_status BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('article', 'video')),
  content TEXT,
  video_url TEXT,
  cover_image_url TEXT,
  excerpt TEXT,
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES psychologists(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_published ON posts(published, published_at DESC) WHERE published = true;

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('subscription', 'personal')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed')),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  sent_via TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- Cron jobs log
CREATE TABLE cron_jobs_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  details JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view/edit their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = sso_uid);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = sso_uid);

-- Daily entries policies
CREATE POLICY "Users can view own entries" ON daily_entries
  FOR SELECT USING (auth.uid()::text = (SELECT sso_uid FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own entries" ON daily_entries
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT sso_uid FROM users WHERE id = user_id));

CREATE POLICY "Users can update own entries" ON daily_entries
  FOR UPDATE USING (auth.uid()::text = (SELECT sso_uid FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own entries" ON daily_entries
  FOR DELETE USING (auth.uid()::text = (SELECT sso_uid FROM users WHERE id = user_id));

-- Psychologists can view subscribed users entries
CREATE POLICY "Psychologists can view subscribed entries" ON daily_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.id = daily_entries.user_id
      WHERE p.user_id = auth.uid()::text
      AND u.subscription_tier IN ('subscription', 'personal')
      AND p.active = true
    )
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', false);

-- Storage policies
CREATE POLICY "Users can upload own audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own audio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audio-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

