import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { perplexityService } from '@/lib/integrations/perplexity'
import { startOfMonth, endOfMonth, differenceInDays, lastDayOfMonth } from 'date-fns'

/**
 * GET /api/cron/monthly-analytics
 * 
 * Automatically generates monthly analytics for all active users
 * Should be run daily via cron job
 * Checks if it's time to generate analytics (every 7 days or last day of month)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret - support both Vercel cron header and Bearer token
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  const isAuthorized = 
    vercelCronHeader === '1' || 
    (cronSecret && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createRouteHandlerClient()

  try {
    // Get all users with active subscriptions
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('subscription_tier', ['subscription', 'personal'])
      .eq('subscription_status', 'active')

    type User = Database['public']['Tables']['users']['Row']
    const users = usersData as User[] | null

    if (usersError || !users || users.length === 0) {
      return NextResponse.json({ message: 'No users to process' })
    }

    const results = []
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12

    for (const user of users) {
      try {
        // Calculate date range for current month
        const monthStart = new Date(currentYear, currentMonth - 1, 1)
        const monthEnd = endOfMonth(monthStart)
        const lastDay = lastDayOfMonth(monthStart)
        
        const daysInMonth = differenceInDays(
          now > monthEnd ? monthEnd : now,
          monthStart
        ) + 1
        
        const weekNumber = Math.ceil(daysInMonth / 7)
        
        // Check if it's time to generate (every 7 days or last day of month)
        const isWeekBoundary = daysInMonth % 7 === 0
        const isLastDay = now.getDate() === lastDay.getDate()
        
        if (!isWeekBoundary && !isLastDay) {
          results.push({ 
            userId: user.id, 
            status: 'skipped', 
            reason: 'Not a week boundary or last day' 
          })
          continue
        }

        // Check if analysis already exists for this week
        const { data: existingAnalysis } = await supabase
          .from('monthly_analytics')
          .select('*')
          .eq('user_id', user.id)
          .eq('year', currentYear)
          .eq('month', currentMonth)
          .eq('week_number', weekNumber)
          .maybeSingle()

        if (existingAnalysis) {
          results.push({ 
            userId: user.id, 
            status: 'skipped', 
            reason: 'Analysis already exists for this week' 
          })
          continue
        }

        // Get all entries for the month up to today
        const { data: entriesData, error: entriesError } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('entry_date', monthStart.toISOString().split('T')[0])
          .lte('entry_date', now > monthEnd ? monthEnd.toISOString().split('T')[0] : now.toISOString().split('T')[0])
          .eq('is_deleted', false)
          .order('entry_date', { ascending: true })

        type Entry = Database['public']['Tables']['daily_entries']['Row']
        const entries = entriesData as Entry[] | null

        if (entriesError || !entries || entries.length < 3) {
          results.push({ 
            userId: user.id, 
            status: 'skipped', 
            reason: 'Not enough entries (minimum 3 required)' 
          })
          continue
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
          year: currentYear,
          month: currentMonth,
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
        
        const { error: insertError } = await supabase
          .from('monthly_analytics')
          .insert(analyticsData as any)

        if (insertError) {
          console.error('Failed to save analytics for user:', user.id, insertError)
          results.push({ 
            userId: user.id, 
            status: 'error', 
            error: insertError.message 
          })
          continue
        }

        results.push({ 
          userId: user.id, 
          status: 'success',
          weekNumber,
          daysAnalyzed: daysInMonth,
          isFinal: isLastDay
        })
      } catch (error: any) {
        console.error('Error processing user:', user.id, error)
        results.push({ 
          userId: user.id, 
          status: 'error', 
          error: error.message 
        })
      }
    }

    return NextResponse.json({ 
      message: 'Monthly analytics cron job completed',
      results,
      summary: {
        total: users.length,
        success: results.filter(r => r.status === 'success').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        error: results.filter(r => r.status === 'error').length,
      }
    })
  } catch (error: any) {
    console.error('Monthly analytics cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


