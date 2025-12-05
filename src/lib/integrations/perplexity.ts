interface AnalysisRequest {
  entries: Array<{
    date: string
    mood: number
    text: string
    factors: string[]
  }>
}

interface AnalysisResponse {
  summary: string
  keyThemes: string[]
  moodTrend: 'improving' | 'declining' | 'stable'
  recommendations: string[]
}

interface MonthlyAnalysisRequest {
  entries: Array<{
    date: string
    mood: number
    text: string
    factors: string[]
  }>
  weekNumber: number
  totalDays: number
}

interface MonthlyAnalysisResponse {
  fullText: string
  generalImpression: string
  positiveTrends: string
  declineReasons: string
  recommendations: string
  reflectionDirections: string
}

export class PerplexityService {
  private apiKey: string
  private baseUrl = 'https://api.perplexity.ai'

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!
  }

  /**
   * Очищает текст от сносок в квадратных скобках (например, [6], [1], [123])
   */
  private cleanCitations(text: string): string {
    // Удаляем цифры в квадратных скобках
    return text.replace(/\[\d+\]/g, '')
  }

  async analyzeWeeklySummary(req: AnalysisRequest): Promise<AnalysisResponse> {
    const prompt = this.buildAnalysisPrompt(req.entries)

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'Ты — опытный психолог. Анализируй записи клиента профессионально и эмпатично.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      const data = await response.json()
      return this.parseAnalysisResponse(data.choices[0].message.content)
    } catch (error) {
      console.error('Perplexity analysis error:', error)
      throw new Error('Failed to analyze weekly summary')
    }
  }

  private buildAnalysisPrompt(entries: AnalysisRequest['entries']): string {
    const entriesText = entries.map(e => 
      `Дата: ${e.date}\nНастроение: ${e.mood}/5\nЗапись: ${e.text}\nФакторы: ${e.factors.join(', ')}`
    ).join('\n\n---\n\n')

    return `
Проанализируй записи клиента за неделю:

${entriesText}

Выдели:
1. Ключевые темы и паттерны
2. Тренд настроения (улучшение/ухудшение/стабильно)
3. Основные влияющие факторы
4. Рекомендации на следующую неделю
5. Конкретные практики для работы над собой

Формат ответа: структурированный текст в markdown.
`
  }

  private parseAnalysisResponse(content: string): AnalysisResponse {
    // Очищаем от сносок Perplexity
    const cleanedContent = this.cleanCitations(content)
    
    return {
      summary: cleanedContent,
      keyThemes: [],
      moodTrend: 'stable',
      recommendations: []
    }
  }

  async analyzeMonthlyMood(req: MonthlyAnalysisRequest): Promise<MonthlyAnalysisResponse> {
    const prompt = this.buildMonthlyAnalysisPrompt(req.entries, req.weekNumber, req.totalDays)

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'Ты — профессиональный психолог и эксперт по эмоциональной регуляции. Твоя задача — анализировать эмоциональное состояние клиента с эмпатией и профессионализмом, без оценок и суждений.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Perplexity API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      
      // Очищаем от сносок Perplexity
      const cleanedContent = this.cleanCitations(content)
      
      return this.parseMonthlyAnalysisResponse(cleanedContent)
    } catch (error) {
      console.error('Perplexity monthly analysis error:', error)
      throw new Error('Failed to analyze monthly mood data')
    }
  }

  private buildMonthlyAnalysisPrompt(
    entries: MonthlyAnalysisRequest['entries'], 
    weekNumber: number,
    totalDays: number
  ): string {
    const entriesText = entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(e => {
        const moodText = this.getMoodText(e.mood)
        return `📅 ${e.date}\n🌡️ Настроение: ${moodText} (${e.mood}/5)\n💭 Запись: ${e.text || 'Не указано'}\n🔖 Факторы: ${e.factors.length > 0 ? e.factors.join(', ') : 'Не указаны'}`
      })
      .join('\n\n---\n\n')

    const weekContext = weekNumber === 1 
      ? 'Это первая неделя анализа в этом месяце.'
      : `Это ${weekNumber}-я неделя месяца. Анализ включает данные за ${totalDays} дней месяца (накопительно).`

    return `Представь, что ты — профессиональный психолог и эксперт по эмоциональной регуляции. Я прислал сообщение с заметками о своём настроении, мыслях и чувствах за отрезок времени.

${weekContext}

Твоя задача:

1. **Проанализировать динамику эмоционального состояния** за указанный период — выявить закономерности, повторяющиеся триггеры, положительные и отрицательные тенденции.

2. **Отметить**, какие события или мысли чаще всего влияли на улучшение или ухудшение настроения.

3. **Сделать мягкий психологический разбор** без оценок — с акцентом на понимание причин, а не на суждение.

4. **Дать конкретные рекомендации**:
   - техники саморегуляции (дыхательные, когнитивные, поведенческие);
   - способы профилактики выгорания, тревожности или апатии (если это уместно);
   - что можно попробовать в дальнейшем, чтобы поддерживать более стабильное и сбалансированное состояние.

**Формат ответа (используй эти заголовки и markdown форматирование):**

## Общее впечатление о периоде
[Твой анализ общей картины эмоционального состояния]

## Положительные тенденции
[Что идет хорошо, какие моменты стоит развивать]

## Возможные причины спада
[Если были трудности — что могло на это повлиять, без критики]

## Рекомендации и техники
[Конкретные практические советы и упражнения]

## Направление для размышлений
[Вопросы и темы для дальнейшей работы над собой]

---

**Вот мои заметки за период:**

${entriesText}

Пожалуйста, проанализируй и дай развернутый ответ в указанном формате.`
  }

  private getMoodText(mood: number): string {
    const moodTexts: Record<number, string> = {
      1: 'Очень плохо',
      2: 'Плохо',
      3: 'Ровно',
      4: 'Хорошо',
      5: 'Отлично'
    }
    return moodTexts[mood] || 'Неизвестно'
  }

  private parseMonthlyAnalysisResponse(content: string): MonthlyAnalysisResponse {
    // Парсим структурированный ответ по заголовкам
    const sections = {
      generalImpression: '',
      positiveTrends: '',
      declineReasons: '',
      recommendations: '',
      reflectionDirections: ''
    }

    // Извлекаем секции по заголовкам
    const generalMatch = content.match(/##\s*Общее впечатление о периоде\s*\n([\s\S]*?)(?=##|$)/i)
    const positiveMatch = content.match(/##\s*Положительные тенденции\s*\n([\s\S]*?)(?=##|$)/i)
    const declineMatch = content.match(/##\s*Возможные причины спада\s*\n([\s\S]*?)(?=##|$)/i)
    const recommendationsMatch = content.match(/##\s*Рекомендации и техники\s*\n([\s\S]*?)(?=##|$)/i)
    const reflectionMatch = content.match(/##\s*Направление для размышлений\s*\n([\s\S]*?)(?=##|$)/i)

    if (generalMatch) sections.generalImpression = generalMatch[1].trim()
    if (positiveMatch) sections.positiveTrends = positiveMatch[1].trim()
    if (declineMatch) sections.declineReasons = declineMatch[1].trim()
    if (recommendationsMatch) sections.recommendations = recommendationsMatch[1].trim()
    if (reflectionMatch) sections.reflectionDirections = reflectionMatch[1].trim()

    return {
      fullText: content,
      ...sections
    }
  }
}

export const perplexityService = new PerplexityService()

