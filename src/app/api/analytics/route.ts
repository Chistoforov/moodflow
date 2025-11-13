import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/analytics?year=2024&month=11
 * 
 * Gets monthly analytics for the specified month
 * Returns the most recent (or final) analytics for that month
 */
export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient()

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const now = new Date()
    const year = parseInt(searchParams.get('year') || now.getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (now.getMonth() + 1).toString())

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      )
    }

    // Get the most recent analytics for this month
    // Prefer final analytics, otherwise get the latest week
    const { data: analytics, error: analyticsError } = await supabase
      .from('monthly_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month)
      .order('is_final', { ascending: false })
      .order('week_number', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: any; error: any }

    if (analyticsError) {
      console.error('Failed to fetch analytics:', analyticsError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    if (!analytics) {
      return NextResponse.json({
        hasAnalytics: false,
        analytics: null,
        message: 'No analytics found for this month'
      })
    }

    return NextResponse.json({
      hasAnalytics: true,
      analytics,
      isFinal: analytics.is_final
    })
  } catch (error: any) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

