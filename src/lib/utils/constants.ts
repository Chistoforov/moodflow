import { Frown, Meh, Smile, Laugh, TrendingDown, type LucideIcon } from 'lucide-react'

export interface MoodLevelConfig {
  value: number
  label: string
  Icon: LucideIcon
  color: 'bg-red-500' | 'bg-orange-500' | 'bg-yellow-500' | 'bg-green-500' | 'bg-emerald-500'
}

export const MOOD_LEVELS: MoodLevelConfig[] = [
  { value: 1, label: 'очень плохо', Icon: Frown, color: 'bg-red-500' },
  { value: 2, label: 'плохо', Icon: TrendingDown, color: 'bg-orange-500' },
  { value: 3, label: 'ровно', Icon: Meh, color: 'bg-yellow-500' },
  { value: 4, label: 'хорошо', Icon: Smile, color: 'bg-green-500' },
  { value: 5, label: 'очень хорошо', Icon: Laugh, color: 'bg-emerald-500' },
]

export const FACTORS = [
  { value: 'pms', label: 'ПМС' },
  { value: 'sleep_deprived', label: 'Не выспалась' },
  { value: 'sick', label: 'Болею' },
  { value: 'conflict', label: 'Конфликт' },
  { value: 'stress', label: 'Стресс' },
  { value: 'work', label: 'Работа' },
  { value: 'family', label: 'Семья' },
  { value: 'relationship', label: 'Отношения' },
  { value: 'finances', label: 'Финансы' },
  { value: 'health', label: 'Здоровье' },
  { value: 'entertainment', label: 'Развлечения' },
  { value: 'rest', label: 'Отдых' },
]

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Бесплатно',
    features: [
      'Календарь настроения',
      'Заметки и аудио',
      'Авто-анализ от ИИ',
      'Общие материалы',
    ],
    price: 0,
  },
  subscription: {
    name: 'Подписка',
    features: [
      'Всё из бесплатного',
      'Рекомендация от психолога раз в неделю',
      'Недельные отчёты',
    ],
    price: 990,
  },
  personal: {
    name: 'Личный психолог',
    features: [
      'Всё из подписки',
      'Постоянный чат с психологом',
      'Приоритетная поддержка',
    ],
    price: 4990,
  },
}

export const CATEGORIES = [
  'work',
  'relationships',
  'health',
  'finances',
  'family',
  'self-development',
  'anxiety',
  'stress',
]

