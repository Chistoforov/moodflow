import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { perplexityService } from '@/lib/integrations/perplexity'
import { telegramService } from '@/lib/integrations/telegram'

export async function GET(request: NextRequest) {
  // Verify cron secret - support both Vercel cron header and Bearer token
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Vercel automatically adds x-vercel-cron header for scheduled cron jobs
  // For manual calls, use Bearer token
  const isAuthorized = 
    vercelCronHeader === '1' || 
    (cronSecret && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createRouteHandlerClient()

  try {
    // Get all users with subscription or personal tier
    const { data, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('subscription_tier', ['subscription', 'personal'])
      .eq('subscription_status', 'active')

    type User = Database['public']['Tables']['users']['Row']
    const users = data as User[] | null

    if (usersError || !users || users.length === 0) {
      return NextResponse.json({ message: 'No users to process' })
    }

    const results = []

    for (const user of users) {
      try {
        // Get last 7 days of entries
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: entriesData, error: entriesError } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('entry_date', sevenDaysAgo.toISOString())
          .eq('is_deleted', false)

        type Entry = Database['public']['Tables']['daily_entries']['Row']
        const entries = entriesData as Entry[] | null

        if (entriesError || !entries || entries.length === 0) continue

        // Analyze with Perplexity
        const analysis = await perplexityService.analyzeWeeklySummary({
          entries: entries.map(e => ({
            date: e.entry_date,
            mood: e.mood_score || 3,
            text: e.text_entry || '',
            factors: e.factors || [],
          })),
        })

        // Save weekly summary
        type SummaryInsert = Database['public']['Tables']['weekly_summaries']['Insert']
        const summaryData: SummaryInsert = {
          user_id: user.id,
          week_start: sevenDaysAgo.toISOString().split('T')[0],
          week_end: new Date().toISOString().split('T')[0],
          summary_text: analysis.summary,
          key_themes: analysis.keyThemes,
          mood_trend: analysis.moodTrend,
          status: 'completed',
        }
        
        const { data: summaryResult } = await (supabase
          .from('weekly_summaries')
          .insert(summaryData as any)
          .select()
          .maybeSingle())

        type Summary = Database['public']['Tables']['weekly_summaries']['Row']
        const summary = summaryResult as Summary | null

        // Send notification if telegram_id exists
        if (user.telegram_id && summary) {
          await telegramService.sendWeeklySummaryNotification(
            user.telegram_id,
            summary.id
          )
        }

        results.push({ userId: user.id, status: 'success' })
      } catch (error: any) {
        results.push({ userId: user.id, status: 'error', error: error.message })
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

