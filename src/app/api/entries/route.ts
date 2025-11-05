import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('sso_uid', session.user.id)
    .maybeSingle()

  type User = Database['public']['Tables']['users']['Row']
  const user = userData as User | null

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: entries, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('entry_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entries })
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { entry_date, mood_score, text_entry, factors } = body

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('sso_uid', session.user.id)
    .maybeSingle()

  type User = Database['public']['Tables']['users']['Row']
  const user = userData as User | null

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Normalize empty strings to null for database compatibility
  const entryData: Database['public']['Tables']['daily_entries']['Insert'] = {
    user_id: user.id,
    entry_date,
    mood_score: mood_score ?? null,
    text_entry: text_entry?.trim() || null,
    factors: factors && factors.length > 0 ? factors : null,
    is_deleted: false,
  }

  const { data: entry, error } = await supabase
    .from('daily_entries')
    .upsert([entryData] as any, {
      onConflict: 'user_id,entry_date',
    })
    .select()
    .maybeSingle()

  if (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry })
}

