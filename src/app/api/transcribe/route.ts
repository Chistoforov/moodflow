import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { perplexityService } from '@/lib/integrations/perplexity'
import { Database } from '@/types/database'

type AudioEntry = Database['public']['Tables']['audio_entries']['Row']
type DailyEntry = Database['public']['Tables']['daily_entries']['Row']
type DailyEntryPartial = Pick<DailyEntry, 'text_entry' | 'audio_url' | 'audio_duration' | 'mood_score' | 'factors'>

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for transcription

interface Message {
  id: string
  text: string | null
  audioUrl?: string | null
  transcript?: string | null
  timestamp: string
  type: 'text' | 'audio'
}

export async function POST(request: NextRequest) {
  try {
    const { audioEntryId, audioUrl } = await request.json()

    if (!audioEntryId || !audioUrl) {
      return NextResponse.json(
        { error: 'Missing audioEntryId or audioUrl' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get audio entry to retrieve user_id and entry_date
    const { data: audioEntry, error: audioEntryError } = await supabase
      .from('audio_entries')
      .select('user_id, entry_date')
      .eq('id', audioEntryId)
      .single()

    if (audioEntryError) {
      console.error('Failed to get audio entry:', audioEntryError)
      return NextResponse.json(
        { error: 'Failed to get audio entry' },
        { status: 500 }
      )
    }

    if (!audioEntry) {
      console.error('Audio entry not found')
      return NextResponse.json(
        { error: 'Audio entry not found' },
        { status: 404 }
      )
    }

    // Type assertion for audioEntry
    const typedAudioEntry = audioEntry as Pick<AudioEntry, 'user_id' | 'entry_date'>

    // Update status to 'processing'
    await supabase
      .from('audio_entries')
      // @ts-expect-error - Supabase typing issue with update method
      .update({ processing_status: 'processing' })
      .eq('id', audioEntryId)

    try {
      // Call OpenAI Whisper API for transcription
      const transcript = await perplexityService.transcribeAudio({
        audioUrl,
        language: 'ru',
      })

      // Update audio entry with transcript and set status to 'completed'
      const { data: updatedAudioEntry, error: updateError } = await supabase
        .from('audio_entries')
        // @ts-expect-error - Supabase typing issue with update method
        .update({
          transcript,
          processing_status: 'completed',
        })
        .eq('id', audioEntryId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Get current daily entry to update text_entry
      const { data: dailyEntry, error: dailyEntryError } = await supabase
        .from('daily_entries')
        .select('text_entry, audio_url, audio_duration, mood_score, factors')
        .eq('user_id', typedAudioEntry.user_id)
        .eq('entry_date', typedAudioEntry.entry_date)
        .maybeSingle()

      if (dailyEntryError) {
        console.error('Failed to get daily entry:', dailyEntryError)
        // Continue anyway - we'll try to create/update it
      }

      // Type assertion for dailyEntry
      const typedDailyEntry = dailyEntry as DailyEntryPartial | null

      // Parse existing messages or create new array
      let messages: Message[] = []
      if (typedDailyEntry?.text_entry) {
        try {
          messages = JSON.parse(typedDailyEntry.text_entry) as Message[]
          // Validate it's an array
          if (!Array.isArray(messages)) {
            messages = []
          }
        } catch (parseError) {
          console.error('Failed to parse text_entry:', parseError)
          messages = []
        }
      }

      // Add new text message with transcript
      const newMessage: Message = {
        id: `text-${Date.now()}-${Math.random()}`,
        text: transcript,
        timestamp: new Date().toISOString(),
        type: 'text'
      }
      messages.push(newMessage)

      // Update or create daily entry with the new text_entry
      // Preserve existing fields if they exist
      const dailyEntryData: any = {
        user_id: typedAudioEntry.user_id,
        entry_date: typedAudioEntry.entry_date,
        text_entry: JSON.stringify(messages),
        processing_status: 'completed',
        is_deleted: false,
      }

      // Preserve existing fields if daily entry exists
      if (typedDailyEntry) {
        if (typedDailyEntry.audio_url) dailyEntryData.audio_url = typedDailyEntry.audio_url
        if (typedDailyEntry.audio_duration) dailyEntryData.audio_duration = typedDailyEntry.audio_duration
        if (typedDailyEntry.mood_score !== null) dailyEntryData.mood_score = typedDailyEntry.mood_score
        if (typedDailyEntry.factors) dailyEntryData.factors = typedDailyEntry.factors
      }

      const { error: updateDailyEntryError } = await supabase
        .from('daily_entries')
        // @ts-expect-error - Supabase typing issue with upsert method
        .upsert([dailyEntryData], {
          onConflict: 'user_id,entry_date',
        })

      if (updateDailyEntryError) {
        console.error('Failed to update daily entry with transcript:', updateDailyEntryError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        transcript,
        audioEntryId,
      })

    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError)
      
      // Update status to 'failed'
      await supabase
        .from('audio_entries')
        // @ts-expect-error - Supabase typing issue with update method
        .update({ 
          processing_status: 'failed',
        })
        .eq('id', audioEntryId)

      return NextResponse.json(
        { 
          error: 'Transcription failed',
          details: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Transcribe API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


