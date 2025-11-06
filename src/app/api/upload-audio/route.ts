import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type DailyEntry = Database['public']['Tables']['daily_entries']['Row']
type AudioEntry = Database['public']['Tables']['audio_entries']['Row']

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from users table (needed for daily_entries which references users.id, not auth.users.id)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('sso_uid', authUser.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = (userData as Pick<Database['public']['Tables']['users']['Row'], 'id'>).id // This is users.id, needed for daily_entries
    const authUserId = authUser.id // This is auth.users.id, needed for audio_entries

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
    const fileName = `${authUserId}/${date}/${timestamp}.${fileExt}`

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
      // Return more detailed error message
      const errorMessage = uploadError.message || 'Failed to upload audio'
      return NextResponse.json(
        { error: errorMessage, details: uploadError },
        { status: 500 }
      )
    }

    // Get signed URL for better access (works even if bucket is private)
    const { data: signedUrlData } = await supabase
      .storage
      .from('audio-entries')
      .createSignedUrl(fileName, 3600) // 1 hour expiry

    // Fallback to public URL if signed URL fails
    const { data: { publicUrl } } = supabase
      .storage
      .from('audio-entries')
      .getPublicUrl(fileName)
    
    const audioUrl = signedUrlData?.signedUrl || publicUrl

    // Create audio entry record in audio_entries table
    // Note: audio_entries.user_id references auth.users(id)
    const audioEntryData: Database['public']['Tables']['audio_entries']['Insert'] = {
      user_id: authUserId,
      entry_date: date,
      audio_url: audioUrl,
      audio_duration: Math.round(file.size / 16000), // Rough estimate
      processing_status: 'pending',
      is_deleted: false,
    }

    const { data: audioEntry, error: audioEntryError } = await supabase
      .from('audio_entries')
      .insert(audioEntryData as any)
      .select()
      .single()

    if (audioEntryError || !audioEntry) {
      console.error('Database error creating audio entry:', audioEntryError)
      return NextResponse.json(
        { error: 'Failed to save audio entry', details: audioEntryError },
        { status: 500 }
      )
    }

    // Also update or create daily entry with audio_url for backward compatibility
    // Note: daily_entries.user_id references users(id), not auth.users(id)
    const entryData: Database['public']['Tables']['daily_entries']['Insert'] = {
      user_id: userId,
      entry_date: date,
      audio_url: audioUrl,
      audio_duration: Math.round(file.size / 16000),
      processing_status: 'pending',
      is_deleted: false,
    }

    const { data: dailyEntry, error: dailyEntryError } = await supabase
      .from('daily_entries')
      .upsert([entryData] as any)
      .select()
      .single()

    if (dailyEntryError) {
      console.error('Warning: Failed to update daily entry:', dailyEntryError)
      // Don't fail the request, just log the error
    }

    const typedAudioEntry = audioEntry as AudioEntry
    const typedDailyEntry = dailyEntry as DailyEntry | null

    // Trigger transcription in background (fire and forget)
    fetch(`${request.nextUrl.origin}/api/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioEntryId: typedAudioEntry.id,
        audioUrl: audioUrl,
        fileName: fileName, // Pass fileName for direct download if needed
      }),
    }).catch(err => console.error('Failed to trigger transcription:', err))

    return NextResponse.json({
      success: true,
      entryId: typedDailyEntry?.id || typedAudioEntry.id,
      audioEntryId: typedAudioEntry.id,
      audioUrl: audioUrl,
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


