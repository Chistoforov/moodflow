import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - сгенерировать или обновить аналитику для пользователя
export async function POST(
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
    const { year, month } = body

    if (!year || !month) {
      return NextResponse.json({ error: 'Year and month are required' }, { status: 400 })
    }

    // Get all entries for this user for the specified month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('entry_date, mood_score, factors, text_entry, transcript')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'No entries found for this period' }, { status: 400 })
    }

    // Prepare entries for Perplexity
    const formattedEntries = entries
      .filter(e => e.mood_score !== null)
      .map(entry => {
        const factors = Array.isArray(entry.factors) ? entry.factors.join(', ') : ''
        let text = ''
        
        if (entry.text_entry) {
          try {
            const messages = JSON.parse(entry.text_entry)
            if (Array.isArray(messages)) {
              text = messages
                .filter((msg: any) => msg.text && msg.type === 'text')
                .map((msg: any) => msg.text)
                .join('\n')
            } else {
              text = entry.text_entry
            }
          } catch {
            text = entry.text_entry
          }
        }
        
        if (entry.transcript) {
          text = text ? `${text}\n${entry.transcript}` : entry.transcript
        }

        return `Дата: ${entry.entry_date}, Настроение: ${entry.mood_score}/5${factors ? `, Факторы: ${factors}` : ''}${text ? `\nОписание: ${text}` : ''}`
      })

    if (formattedEntries.length === 0) {
      return NextResponse.json({ error: 'No valid entries with mood scores found' }, { status: 400 })
    }

    // Calculate days analyzed and week number
    const daysAnalyzed = formattedEntries.length
    const weekNumber = Math.ceil(daysAnalyzed / 7)
    
    // Check if this is the final analysis (last day of month)
    const today = new Date()
    const lastDayOfMonth = new Date(year, month, 0).getDate()
    const currentDay = today.getDate()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const isFinal = !isCurrentMonth || currentDay >= lastDayOfMonth

    // Call Perplexity API
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      return NextResponse.json({ error: 'Perplexity API key not configured' }, { status: 500 })
    }

    const prompt = `Ты профессиональный психолог, анализирующий дневник настроения пользователя.

${isFinal ? 'Это ФИНАЛЬНЫЙ анализ за весь месяц.' : `Это промежуточный анализ за неделю ${weekNumber} (${daysAnalyzed} дней накопительно с начала месяца).`}

Записи пользователя:
${formattedEntries.join('\n\n')}

Предоставь структурированный анализ по следующим категориям:

1. ОБЩЕЕ ВПЕЧАТЛЕНИЕ О ПЕРИОДЕ
Краткий обзор эмоционального состояния за период

2. ПОЛОЖИТЕЛЬНЫЕ ТЕНДЕНЦИИ
Что идет хорошо, позитивные моменты

3. ВОЗМОЖНЫЕ ПРИЧИНЫ СПАДА
Анализ трудностей без критики и осуждения

4. РЕКОМЕНДАЦИИ И ТЕХНИКИ
Конкретные практические советы

5. НАПРАВЛЕНИЕ ДЛЯ РАЗМЫШЛЕНИЙ
Темы для дальнейшей работы

Формат ответа: каждая категория должна быть отдельным параграфом без заголовков. Разделяй категории двумя переносами строки.`

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!perplexityResponse.ok) {
      console.error('Perplexity API error:', await perplexityResponse.text())
      return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 })
    }

    const perplexityData = await perplexityResponse.json()
    const analysisText = perplexityData.choices[0]?.message?.content

    if (!analysisText) {
      return NextResponse.json({ error: 'No analysis generated' }, { status: 500 })
    }

    // Parse the analysis into sections
    const sections = analysisText.split('\n\n').filter((s: string) => s.trim())
    
    const [
      general_impression = '',
      positive_trends = '',
      decline_reasons = '',
      recommendations = '',
      reflection_directions = ''
    ] = sections

    // Check if analytics already exists
    const { data: existingAnalytics } = await supabase
      .from('monthly_analytics')
      .select('id')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let result
    if (existingAnalytics) {
      // Update existing
      const { data, error } = await supabase
        .from('monthly_analytics')
        .update({
          week_number: weekNumber,
          days_analyzed: daysAnalyzed,
          analysis_text: analysisText,
          general_impression,
          positive_trends,
          decline_reasons,
          recommendations,
          reflection_directions,
          is_final: isFinal,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAnalytics.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating analytics:', error)
        return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
      }
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('monthly_analytics')
        .insert({
          user_id: userId,
          year,
          month,
          week_number: weekNumber,
          days_analyzed: daysAnalyzed,
          analysis_text: analysisText,
          general_impression,
          positive_trends,
          decline_reasons,
          recommendations,
          reflection_directions,
          is_final: isFinal,
          status: 'completed'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating analytics:', error)
        return NextResponse.json({ error: 'Failed to create analytics' }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({
      analytics: result,
      weekNumber,
      daysAnalyzed,
      isFinal
    })
  } catch (error) {
    console.error('Error in POST /api/admin/users/[userId]/analytics/generate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

