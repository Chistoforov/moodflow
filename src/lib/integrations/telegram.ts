import TelegramBot from 'node-telegram-bot-api'

export class TelegramService {
  private bot: TelegramBot

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN!
    this.bot = new TelegramBot(token, { polling: false })
  }

  async sendNotification(
    telegramId: number,
    message: string,
    url: string
  ): Promise<void> {
    try {
      await this.bot.sendMessage(telegramId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '📱 Открыть MoodFlow',
              url: url
            }
          ]]
        }
      })
    } catch (error) {
      console.error('Telegram send error:', error)
      throw error
    }
  }

  async sendRecommendationNotification(
    telegramId: number,
    recommendationId: string
  ): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/recommendations/${recommendationId}`
    const message = '📝 *Новая рекомендация от психолога!*\n\nПосмотрите, что для вас подготовили.'
    
    await this.sendNotification(telegramId, message, url)
  }

  async sendWeeklySummaryNotification(
    telegramId: number,
    summaryId: string
  ): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/summaries/${summaryId}`
    const message = '📊 *Готов ваш еженедельный отчёт!*\n\nПосмотрите анализ вашего настроения за неделю.'
    
    await this.sendNotification(telegramId, message, url)
  }
}

export const telegramService = new TelegramService()

