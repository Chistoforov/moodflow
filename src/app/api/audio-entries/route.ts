import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export const runtime = 'nodejs'

// GET /api/audio-entries?date=YYYY-MM-DD - Get all audio entries for a specific date
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Missing date parameter' },
        { status: 400 }
      )
    }

    // Get all audio entries for the date
    const { data: audioEntries, error: dbError } = await supabase
      .from('audio_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', date)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch audio entries' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      audioEntries: audioEntries || [],
    })

  } catch (error) {
    console.error('Get audio entries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/audio-entries - Upload a new audio entry
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
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a']
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

    // Create new audio entry record
    const { data: audioEntry, error: dbError } = await supabase
      .from('audio_entries')
      .insert({
        user_id: user.id,
        entry_date: date,
        audio_url: publicUrl,
        audio_duration: Math.round(file.size / 16000), // Rough estimate
        processing_status: 'pending',
      } as any)
      .select()
      .single()

    if (dbError || !audioEntry) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save audio entry' },
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
        audioEntryId: (audioEntry as any).id,
        audioUrl: publicUrl,
      }),
    }).catch(err => console.error('Failed to trigger transcription:', err))

    return NextResponse.json({
      success: true,
      audioEntry,
    })

  } catch (error) {
    console.error('Upload audio entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/audio-entries?id=UUID - Delete (soft delete) an audio entry
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      )
    }

    // Soft delete the audio entry
    const { error: dbError } = await supabase
      .from('audio_entries')
      // @ts-expect-error - Supabase typing issue with update method
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this entry

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to delete audio entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })

  } catch (error) {
    console.error('Delete audio entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

