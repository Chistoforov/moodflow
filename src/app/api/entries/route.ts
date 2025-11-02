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

  const { data: entry, error } = await supabase
    .from('daily_entries')
    .upsert({
      user_id: user.id,
      entry_date,
      mood_score,
      text_entry,
      factors,
    } as any)
    .select()
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry })
}

