interface TranscriptionRequest {
  audioUrl: string
  language?: string
}

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

  async transcribeAudio(req: TranscriptionRequest): Promise<string> {
    try {
      // Use OpenAI Whisper API for transcription
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY is not configured')
      }

      // Download audio file with retry logic
      let audioBuffer: ArrayBuffer
      let audioType = 'audio/webm'
      
      try {
        const audioResponse = await fetch(req.audioUrl, {
          headers: {
            'Accept': 'audio/*',
          },
        })
        
        if (!audioResponse.ok) {
          throw new Error(`Failed to download audio: ${audioResponse.status} ${audioResponse.statusText}`)
        }
        
        audioBuffer = await audioResponse.arrayBuffer()
        audioType = audioResponse.headers.get('content-type') || 'audio/webm'
      } catch (fetchError) {
        console.error('Error downloading audio from URL:', fetchError)
        throw new Error(`Failed to download audio file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`)
      }
      
      // Create form data for Whisper API
      // In Node.js, we need to use File or Blob properly
      const formData = new FormData()
      
      // Determine file extension from content type
      let fileExtension = 'webm'
      if (audioType.includes('mp4') || audioType.includes('m4a')) {
        fileExtension = 'm4a'
      } else if (audioType.includes('wav')) {
        fileExtension = 'wav'
      } else if (audioType.includes('ogg')) {
        fileExtension = 'ogg'
      } else if (audioType.includes('mp3') || audioType.includes('mpeg')) {
        fileExtension = 'mp3'
      }
      
      // Create a File-like object for FormData
      // In Node.js 18+, FormData supports Blob
      const audioBlob = new Blob([audioBuffer], { type: audioType })
      const audioFile = new File([audioBlob], `audio.${fileExtension}`, { type: audioType })
      
      formData.append('file', audioFile)
      formData.append('model', 'whisper-1')
      formData.append('language', req.language || 'ru')
      formData.append('response_format', 'json')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI Whisper API error:', errorText)
        throw new Error(`Whisper API failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      if (!data.text) {
        throw new Error('Transcription returned empty text')
      }
      
      return data.text
    } catch (error) {
      console.error('Audio transcription error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to transcribe audio: ${errorMessage}`)
    }
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

