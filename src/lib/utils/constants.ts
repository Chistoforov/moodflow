export const MOOD_LEVELS = [
  { value: 1, label: '😢', emoji: '😢', color: 'bg-red-500' },
  { value: 2, label: '😕', emoji: '😕', color: 'bg-orange-500' },
  { value: 3, label: '😐', emoji: '😐', color: 'bg-yellow-500' },
  { value: 4, label: '🙂', emoji: '🙂', color: 'bg-green-500' },
  { value: 5, label: '😄', emoji: '😄', color: 'bg-emerald-500' },
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

