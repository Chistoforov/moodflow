import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for transcription

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('audio') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Missing audio file' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid audio format' },
        { status: 400 }
      )
    }

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Transcription service not configured' },
        { status: 500 }
      )
    }

    try {
      // Convert file to buffer for Whisper API
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = Buffer.from(arrayBuffer)
      
      // Determine file extension from content type
      let fileExtension = 'webm'
      if (file.type.includes('mp4') || file.type.includes('m4a')) {
        fileExtension = 'm4a'
      } else if (file.type.includes('wav')) {
        fileExtension = 'wav'
      } else if (file.type.includes('ogg')) {
        fileExtension = 'ogg'
      } else if (file.type.includes('mp3') || file.type.includes('mpeg')) {
        fileExtension = 'mp3'
      }
      
      // Create FormData for Whisper API
      const whisperFormData = new FormData()
      const audioBlob = new Blob([audioBuffer], { type: file.type })
      const audioFile = new File([audioBlob], `audio.${fileExtension}`, { type: file.type })
      
      whisperFormData.append('file', audioFile)
      whisperFormData.append('model', 'whisper-1')
      whisperFormData.append('language', 'ru')
      whisperFormData.append('response_format', 'json')

      // Call OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: whisperFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI Whisper API error:', errorText)
        return NextResponse.json(
          { error: 'Failed to transcribe audio' },
          { status: 500 }
        )
      }

      const data = await response.json()
      if (!data.text) {
        return NextResponse.json(
          { error: 'Transcription returned empty text' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        transcript: data.text,
      })

    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError)
      const errorMessage = transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'
      return NextResponse.json(
        { error: 'Failed to transcribe audio', details: errorMessage },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Transcribe audio API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

