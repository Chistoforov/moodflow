import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('audio') as File
    const date = formData.get('date') as string

    if (!file || !date) {
      return NextResponse.json(
        { error: 'Missing audio file or date' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid audio format' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop() || 'webm'
    const fileName = `${user.id}/${date}/${timestamp}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('audio-entries')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload audio' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('audio-entries')
      .getPublicUrl(fileName)

    // Update or create entry with audio_url and set processing_status to 'pending'
    const { data: entry, error: dbError } = await (supabase
      .from('daily_entries') as any)
      .upsert({
        user_id: user.id,
        entry_date: date,
        audio_url: publicUrl,
        audio_duration: Math.round(file.size / 16000), // Rough estimate
        processing_status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save entry' },
        { status: 500 }
      )
    }

    // Trigger transcription in background (fire and forget)
    fetch(`${request.nextUrl.origin}/api/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entryId: entry.id,
        audioUrl: publicUrl,
      }),
    }).catch(err => console.error('Failed to trigger transcription:', err))

    return NextResponse.json({
      success: true,
      entryId: entry.id,
      audioUrl: publicUrl,
      status: 'pending',
    })

  } catch (error) {
    console.error('Upload audio error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


