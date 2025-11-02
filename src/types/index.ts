export interface MoodLevel {
  value: number
  label: string
  emoji: string
  color: string
}

export interface Factor {
  value: string
  label: string
}

export interface SubscriptionTier {
  name: string
  features: string[]
  price: number
}

export interface DailyEntry {
  id: string
  user_id: string
  entry_date: string
  mood_score: number | null
  text_entry: string | null
  audio_url: string | null
  audio_duration: number | null
  transcript: string | null
  factors: string[] | null
  summary_category: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Recommendation {
  id: string
  user_id: string
  psychologist_id: string | null
  weekly_summary_id: string | null
  title: string | null
  text: string
  recommendation_type: 'weekly' | 'personal' | 'ai'
  read_status: boolean
  read_at: string | null
  notification_sent: boolean
  notification_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface WeeklySummary {
  id: string
  user_id: string
  week_start: string
  week_end: string
  summary_text: string | null
  key_themes: string[] | null
  mood_trend: string | null
  perplexity_request_id: string | null
  perplexity_response: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
}

