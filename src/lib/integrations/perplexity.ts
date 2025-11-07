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

export class PerplexityService {
  private apiKey: string
  private baseUrl = 'https://api.perplexity.ai'

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!
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
    // Простой парсинг - можно улучшить
    return {
      summary: content,
      keyThemes: [],
      moodTrend: 'stable',
      recommendations: []
    }
  }
}

export const perplexityService = new PerplexityService()

