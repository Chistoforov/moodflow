import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { perplexityService } from '@/lib/integrations/perplexity'
import { startOfMonth, endOfMonth, differenceInDays, lastDayOfMonth } from 'date-fns'

/**
 * POST /api/analytics/generate
 * 
 * Generates monthly analytics for the current user
 * Accumulates data week by week within a month
 */
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient()

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body (optional: can specify year/month, default to current)
    const body = await request.json().catch(() => ({}))
    const now = new Date()
    const targetYear = body.year || now.getFullYear()
    const targetMonth = body.month || now.getMonth() + 1 // 1-12

    // Calculate date range
    const monthStart = new Date(targetYear, targetMonth - 1, 1)
    const monthEnd = endOfMonth(monthStart)
    const today = new Date()
    const lastDay = lastDayOfMonth(monthStart)
    
    // Determine how many complete weeks have passed
    const daysInMonth = differenceInDays(
      today > monthEnd ? monthEnd : today,
      monthStart
    ) + 1
    
    // Calculate week number (1-4+)
    const weekNumber = Math.ceil(daysInMonth / 7)
    
    // Check if we should generate (every 7 days or last day of month)
    const isLastDay = today.getDate() === lastDay.getDate() && 
                      today.getMonth() === monthStart.getMonth() &&
                      today.getFullYear() === monthStart.getFullYear()
    
    // Check if analysis already exists for this week
    const { data: existingAnalysis } = await supabase
      .from('monthly_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', targetYear)
      .eq('month', targetMonth)
      .eq('week_number', weekNumber)
      .maybeSingle()

    if (existingAnalysis) {
      return NextResponse.json({
        message: 'Analysis already exists for this week',
        analysis: existingAnalysis
      })
    }

    // Get all entries for the month up to today
    const { data: entriesData, error: entriesError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', monthStart.toISOString().split('T')[0])
      .lte('entry_date', today > monthEnd ? monthEnd.toISOString().split('T')[0] : today.toISOString().split('T')[0])
      .eq('is_deleted', false)
      .order('entry_date', { ascending: true })

    type Entry = Database['public']['Tables']['daily_entries']['Row']
    const entries = entriesData as Entry[] | null

    if (entriesError || !entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries found for this month' },
        { status: 400 }
      )
    }

    // Analyze with Perplexity
    const analysis = await perplexityService.analyzeMonthlyMood({
      entries: entries.map(e => ({
        date: e.entry_date,
        mood: e.mood_score || 3,
        text: e.text_entry || '',
        factors: e.factors || [],
      })),
      weekNumber,
      totalDays: daysInMonth,
    })

    // Save monthly analytics
    type AnalyticsInsert = Database['public']['Tables']['monthly_analytics']['Insert']
    const analyticsData: AnalyticsInsert = {
      user_id: user.id,
      year: targetYear,
      month: targetMonth,
      week_number: weekNumber,
      days_analyzed: daysInMonth,
      analysis_text: analysis.fullText,
      general_impression: analysis.generalImpression,
      positive_trends: analysis.positiveTrends,
      decline_reasons: analysis.declineReasons,
      recommendations: analysis.recommendations,
      reflection_directions: analysis.reflectionDirections,
      is_final: isLastDay,
      status: 'completed',
    }
    
    const { data: analyticsResult, error: insertError } = await supabase
      .from('monthly_analytics')
      .insert(analyticsData as any)
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save analytics:', insertError)
      return NextResponse.json(
        { error: 'Failed to save analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analytics: analyticsResult,
      weekNumber,
      daysAnalyzed: daysInMonth,
      isFinal: isLastDay
    })
  } catch (error: any) {
    console.error('Analytics generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}


