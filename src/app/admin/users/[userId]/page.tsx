'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

interface UserInfo {
  id: string
  email: string
  full_name: string | null
}

interface DayEntry {
  date: string
  day: number
  mood_score: number | null
  factors: string[]
  text: string
  has_entries: boolean
}

interface UserEntriesData {
  user: UserInfo
  year: number
  month: number
  entries: DayEntry[]
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Очень плохо',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично'
}

const FACTOR_LABELS: Record<string, string> = {
  'pms': 'ПМС',
  'sleep_deprived': 'Не выспалась',
  'sick': 'Болею',
  'conflict': 'Конфликт',
  'stress': 'Стресс',
  'work': 'Работа',
  'family': 'Семья',
  'relationship': 'Отношения',
  'finances': 'Финансы',
  'health': 'Здоровье',
  'entertainment': 'Развлечения',
  'rest': 'Отдых'
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.userId as string

  const [data, setData] = useState<UserEntriesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    if (userId) {
      fetchUserEntries()
    }
  }, [userId, currentYear, currentMonth])

  const fetchUserEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `/api/admin/users/${userId}/entries?year=${currentYear}&month=${currentMonth}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch user entries')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user entries')
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <button
          onClick={() => router.push('/admin/users')}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-50 transition-colors"
          style={{ backgroundColor: '#E8E2D5', color: '#8B3A3A' }}
        >
          <ArrowLeft size={20} />
          <span>Назад к списку пользователей</span>
        </button>

        <div className="rounded-2xl shadow-sm p-8 text-center" style={{ backgroundColor: '#F5F1EB' }}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8B3A3A' }}></div>
          <p className="mt-4" style={{ color: '#8B3A3A' }}>Загрузка данных...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="px-4 sm:px-0">
        <button
          onClick={() => router.push('/admin/users')}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-50 transition-colors"
          style={{ backgroundColor: '#E8E2D5', color: '#8B3A3A' }}
        >
          <ArrowLeft size={20} />
          <span>Назад к списку пользователей</span>
        </button>

        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
          <p style={{ color: '#8B3A3A' }}>{error || 'Не удалось загрузить данные'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Back button */}
      <button
        onClick={() => router.push('/admin/users')}
        className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-opacity-50 transition-colors"
        style={{ backgroundColor: '#E8E2D5', color: '#8B3A3A' }}
      >
        <ArrowLeft size={20} />
        <span>Назад к списку пользователей</span>
      </button>

      {/* Header with user name and month navigation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>
            {data.user.full_name || data.user.email}
          </h1>
          {data.user.full_name && (
            <p className="mt-2 text-sm" style={{ color: '#8B3A3A', opacity: 0.7 }}>
              {data.user.email}
            </p>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
            style={{ backgroundColor: '#E8E2D5', color: '#8B3A3A' }}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center min-w-[160px]">
            <div className="text-xl font-semibold" style={{ color: '#8B3A3A' }}>
              {MONTH_NAMES[currentMonth - 1]}
            </div>
            <div className="text-sm" style={{ color: '#8B3A3A', opacity: 0.7 }}>
              {currentYear}
            </div>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
            style={{ backgroundColor: '#E8E2D5', color: '#8B3A3A' }}
            aria-label="Следующий месяц"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Entries table */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: '#D4C8B5' }}>
            <thead style={{ backgroundColor: '#E8E2D5' }}>
              <tr>
                <th
                  className="px-4 py-4 text-left text-sm font-semibold w-24"
                  style={{ color: '#8B3A3A' }}
                >
                  Дата
                </th>
                <th
                  className="px-4 py-4 text-left text-sm font-semibold w-32"
                  style={{ color: '#8B3A3A' }}
                >
                  Настроение
                </th>
                <th
                  className="px-4 py-4 text-left text-sm font-semibold w-48"
                  style={{ color: '#8B3A3A' }}
                >
                  Факторы
                </th>
                <th
                  className="px-4 py-4 text-left text-sm font-semibold"
                  style={{ color: '#8B3A3A' }}
                >
                  Описание
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#D4C8B5' }}>
              {data.entries.map((entry) => (
                <tr
                  key={entry.date}
                  className="hover:bg-opacity-50 transition-colors"
                  style={{ 
                    backgroundColor: entry.has_entries ? 'transparent' : 'rgba(217, 207, 191, 0.2)',
                    opacity: entry.has_entries ? 1 : 0.6
                  }}
                >
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8B3A3A' }}>
                    {entry.day} {MONTH_NAMES[currentMonth - 1].substring(0, 3).toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#8B3A3A' }}>
                    {entry.mood_score !== null ? (
                      <div className="flex items-center gap-2">
                        <span>{MOOD_LABELS[entry.mood_score]}</span>
                        <span className="text-xs opacity-70">({entry.mood_score})</span>
                      </div>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#8B3A3A' }}>
                    {entry.factors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {entry.factors.map((factor, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                            style={{ backgroundColor: '#E8E2D5', color: '#8B3A3A' }}
                          >
                            {FACTOR_LABELS[factor] || factor}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#8B3A3A' }}>
                    {entry.text ? (
                      <div className="whitespace-pre-wrap max-w-2xl">
                        {entry.text}
                      </div>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.entries.every(e => !e.has_entries) && (
          <div className="px-6 py-12 text-center">
            <p style={{ color: '#8B3A3A', opacity: 0.7 }}>
              Нет записей за этот месяц
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

