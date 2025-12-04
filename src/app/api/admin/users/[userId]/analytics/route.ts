import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить аналитику пользователя за месяц
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { userId } = await params
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!psychologist || psychologist.role !== 'admin' || !psychologist.active) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month are required' }, { status: 400 })
    }

    // Get analytics for the user
    const { data: analytics, error } = await supabase
      .from('monthly_analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('year', parseInt(year))
      .eq('month', parseInt(month))
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    return NextResponse.json({ 
      analytics: analytics || null,
      hasAnalytics: !!analytics 
    })
  } catch (error) {
    console.error('Error in GET /api/admin/users/[userId]/analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - обновить аналитику (редактирование админом)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { userId } = await params
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!psychologist || psychologist.role !== 'admin' || !psychologist.active) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      analyticsId,
      general_impression,
      positive_trends,
      decline_reasons,
      recommendations,
      reflection_directions
    } = body

    if (!analyticsId) {
      return NextResponse.json({ error: 'Analytics ID is required' }, { status: 400 })
    }

    // Update analytics
    const { data, error } = await supabase
      .from('monthly_analytics')
      .update({
        general_impression,
        positive_trends,
        decline_reasons,
        recommendations,
        reflection_directions,
        updated_at: new Date().toISOString()
      })
      .eq('id', analyticsId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating analytics:', error)
      return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
    }

    return NextResponse.json({ analytics: data })
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[userId]/analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

