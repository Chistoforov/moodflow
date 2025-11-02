export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          sso_uid: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'subscription' | 'personal'
          subscription_status: 'active' | 'canceled' | 'expired'
          subscription_end_date: string | null
          telegram_id: number | null
          telegram_username: string | null
          stripe_customer_id: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      daily_entries: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['daily_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['daily_entries']['Insert']>
      }
      recommendations: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['recommendations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['recommendations']['Insert']>
      }
    }
  }
}

