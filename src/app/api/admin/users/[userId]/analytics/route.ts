import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// GET /api/admin/users/[userId]/analytics?year=2025&month=11
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const supabase = await createRouteHandlerClient()

    // Check authentication and admin role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    type Psychologist = Database['public']['Tables']['psychologists']['Row']
    const psychologistData = psychologist as Psychologist | null

    if (!psychologistData || psychologistData.role !== 'admin' || !psychologistData.active) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month are required' }, { status: 400 })
    }

    // First, get the user's sso_uid (which is the auth.users.id)
    // because monthly_analytics.user_id references auth.users(id), not public.users(id)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('sso_uid')
      .eq('id', userId)
      .single() as { data: { sso_uid: string } | null; error: any }

    if (userError || !user) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('[Admin Analytics] Fetching analytics for:', { userId, sso_uid: user.sso_uid, year, month })

    // Get analytics for the month using sso_uid
    // We want the most relevant one, usually the final one or the latest week
    const { data: analytics, error: analyticsError } = await supabase
      .from('monthly_analytics')
      .select('*')
      .eq('user_id', user.sso_uid)
      .eq('year', parseInt(year))
      .eq('month', parseInt(month))
      .order('is_final', { ascending: false })
      .order('week_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('[Admin Analytics] Query result:', { analytics, analyticsError })

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user analytics' },
      { status: 500 }
    )
  }
}
