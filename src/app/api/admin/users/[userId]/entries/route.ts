import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// GET /api/admin/users/[userId]/entries?year=2025&month=11
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

    // Calculate date range for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

    // Get user info
    type User = Pick<Database['public']['Tables']['users']['Row'], 'id' | 'email' | 'full_name'>
    const { data: user, error: userError } = await (supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single() as any) as { data: User | null; error: any }

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get entries for the month
    type DailyEntry = Database['public']['Tables']['daily_entries']['Row']
    const { data: entries, error: entriesError } = await (supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .lte('entry_date', endDate.toISOString().split('T')[0])
      .order('entry_date', { ascending: true }) as any)

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      throw entriesError
    }

    // Group entries by date (in case multiple entries per day)
    const typedEntries = (entries || []) as DailyEntry[]
    const entriesByDate = typedEntries.reduce<Record<string, DailyEntry[]>>((acc, entry) => {
      const date = entry.entry_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(entry)
      return acc
    }, {})

    // Create array of days for the month
    const daysInMonth = endDate.getDate()
    const monthData = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day)
      const dateStr = date.toISOString().split('T')[0]
      const dayEntries = entriesByDate[dateStr] || []

      // Aggregate data for the day
      let moodScore: number | null = null
      const allFactors = new Set<string>()
      const allTexts: string[] = []

      dayEntries.forEach(entry => {
        // Take the first non-null mood_score
        if (moodScore === null && entry.mood_score !== null) {
          moodScore = entry.mood_score
        }

        // Collect all factors
        if (entry.factors && Array.isArray(entry.factors)) {
          entry.factors.forEach(factor => allFactors.add(factor))
        }

        // Collect all text entries and transcripts
        if (entry.text_entry) {
          // Try to parse as JSON (array of messages)
          try {
            const messages = JSON.parse(entry.text_entry)
            if (Array.isArray(messages)) {
              const texts = messages
                .filter((msg: any) => msg.text && msg.type === 'text')
                .map((msg: any) => msg.text)
              if (texts.length > 0) {
                allTexts.push(texts.join('\n'))
              }
            } else {
              allTexts.push(entry.text_entry)
            }
          } catch {
            // If not JSON, use as is
            allTexts.push(entry.text_entry)
          }
        }
        if (entry.transcript) {
          // Try to parse transcript as JSON too
          try {
            const messages = JSON.parse(entry.transcript)
            if (Array.isArray(messages)) {
              const texts = messages
                .filter((msg: any) => msg.text && msg.type === 'text')
                .map((msg: any) => msg.text)
              if (texts.length > 0) {
                allTexts.push(texts.join('\n'))
              }
            } else {
              allTexts.push(entry.transcript)
            }
          } catch {
            // If not JSON, use as is
            allTexts.push(entry.transcript)
          }
        }
      })

      monthData.push({
        date: dateStr,
        day: day,
        mood_score: moodScore,
        factors: Array.from(allFactors),
        text: allTexts.join('\n\n'),
        has_entries: dayEntries.length > 0
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      year: parseInt(year),
      month: parseInt(month),
      entries: monthData
    })
  } catch (error) {
    console.error('Error fetching user entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user entries' },
      { status: 500 }
    )
  }
}

