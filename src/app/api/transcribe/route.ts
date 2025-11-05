import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { perplexityService } from '@/lib/integrations/perplexity'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for transcription

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

    // Update status to 'processing'
    await supabase
      .from('audio_entries')
      .update({ processing_status: 'processing' })
      .eq('id', audioEntryId)

    try {
      // Call Perplexity API for transcription
      const transcript = await perplexityService.transcribeAudio({
        audioUrl,
        language: 'ru',
      })

      // Update audio entry with transcript and set status to 'completed'
      const { data: updatedEntry, error: updateError } = await supabase
        .from('audio_entries')
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


