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
      psychologists: {
        Row: {
          id: string
          user_id: string | null
          email: string
          full_name: string
          role: 'admin' | 'psychologist'
          bio: string | null
          specialization: string[] | null
          active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['psychologists']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['psychologists']['Insert']>
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
          processing_status: 'pending' | 'processing' | 'completed' | 'failed' | null
          factors: string[] | null
          summary_category: string | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['daily_entries']['Insert']>
      }
      weekly_summaries: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          summary_text: string | null
          key_themes: string[] | null
          mood_trend: string | null
          perplexity_request_id: string | null
          perplexity_response: Json | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          week_start: string
          week_end: string
          summary_text?: string | null
          key_themes?: string[] | null
          mood_trend?: string | null
          perplexity_request_id?: string | null
          perplexity_response?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
        }
        Update: Partial<Database['public']['Tables']['weekly_summaries']['Insert']>
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
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          post_type: 'article' | 'video'
          content: string | null
          video_url: string | null
          cover_image_url: string | null
          excerpt: string | null
          category: string | null
          tags: string[] | null
          author_id: string | null
          likes_count: number
          views_count: number
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'views_count'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      post_reads: {
        Row: {
          id: string
          user_id: string
          post_id: string
          read_at: string
          created_at: string
        }
        Insert: {
          user_id: string
          post_id: string
          read_at?: string
        }
        Update: Partial<Database['public']['Tables']['post_reads']['Insert']>
      }
      audio_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          audio_url: string
          audio_duration: number | null
          transcript: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed' | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          entry_date: string
          audio_url: string
          audio_duration?: number | null
          transcript?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          is_deleted?: boolean
        }
        Update: Partial<Database['public']['Tables']['audio_entries']['Insert']>
      }
    }
  }
}

