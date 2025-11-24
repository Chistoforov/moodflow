'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ArrowLeft, Edit2 } from 'lucide-react'
import EditAnalyticsModal from '@/components/admin/EditAnalyticsModal'
import { FormattedAnalysis } from '@/components/FormattedAnalysis'

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

interface Analytics {
  id: string
  general_impression: string | null
  positive_trends: string | null
  decline_reasons: string | null
  recommendations: string | null
  reflection_directions: string | null
  week_number: number
  days_analyzed: number
  is_final: boolean
  created_at: string
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
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    if (userId) {
      fetchData()
    }
  }, [userId, currentYear, currentMonth])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch entries
      const entriesResponse = await fetch(
        `/api/admin/users/${userId}/entries?year=${currentYear}&month=${currentMonth}`
      )

      if (!entriesResponse.ok) {
        throw new Error('Failed to fetch user entries')
      }

      const entriesResult = await entriesResponse.json()
      setData(entriesResult)

      // Fetch analytics
      const analyticsResponse = await fetch(
        `/api/admin/users/${userId}/analytics?year=${currentYear}&month=${currentMonth}`
      )

      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json()
        setAnalytics(analyticsResult.analytics)
      } else {
        setAnalytics(null)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyticsUpdate = () => {
    // Refresh just the analytics part
    fetch(
      `/api/admin/users/${userId}/analytics?year=${currentYear}&month=${currentMonth}`
    )
      .then(res => res.json())
      .then(data => setAnalytics(data.analytics))
      .catch(console.error)
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
    <div className="px-4 sm:px-0 pb-20">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entries table - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2 rounded-2xl shadow-sm overflow-hidden h-fit" style={{ backgroundColor: '#F5F1EB' }}>
          <div className="p-6 border-b" style={{ borderColor: '#D4C8B5' }}>
            <h2 className="text-xl font-bold" style={{ color: '#8B3A3A' }}>Дневник настроения</h2>
          </div>
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

        {/* Analytics Section - Takes up 1 column on large screens */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#8B3A3A' }}>Аналитика</h2>
              {analytics && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-[#E8E2D5]"
                  style={{ color: '#8B3A3A', border: '1px solid #D4C8B5' }}
                >
                  <Edit2 size={16} />
                  Редактировать
                </button>
              )}
            </div>

            {analytics ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#E8E2D5' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8B3A3A' }}>
                      Неделя {analytics.week_number} • {analytics.days_analyzed} {analytics.days_analyzed === 1 ? 'день' : analytics.days_analyzed < 5 ? 'дня' : 'дней'}
                    </p>
                    {analytics.is_final && (
                      <p className="text-xs mt-1" style={{ color: '#8B3A3A', opacity: 0.7 }}>
                        🎯 Финальная аналитика месяца
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                  {analytics.general_impression && (
                    <div>
                      <h4 className="font-bold mb-2 text-sm" style={{ color: '#8B3A3A' }}>
                        Общее впечатление
                      </h4>
                      <div className="text-sm" style={{ color: '#8B3A3A', opacity: 0.9 }}>
                        <FormattedAnalysis text={analytics.general_impression} />
                      </div>
                    </div>
                  )}

                  {analytics.positive_trends && (
                    <div>
                      <h4 className="font-bold mb-2 text-sm" style={{ color: '#8B3A3A' }}>
                        ✨ Положительные тенденции
                      </h4>
                      <div className="text-sm" style={{ color: '#8B3A3A', opacity: 0.9 }}>
                        <FormattedAnalysis text={analytics.positive_trends} />
                      </div>
                    </div>
                  )}

                  {analytics.decline_reasons && (
                    <div>
                      <h4 className="font-bold mb-2 text-sm" style={{ color: '#8B3A3A' }}>
                        🔍 Возможные причины спада
                      </h4>
                      <div className="text-sm" style={{ color: '#8B3A3A', opacity: 0.9 }}>
                        <FormattedAnalysis text={analytics.decline_reasons} />
                      </div>
                    </div>
                  )}

                  {analytics.recommendations && (
                    <div>
                      <h4 className="font-bold mb-2 text-sm" style={{ color: '#8B3A3A' }}>
                        💡 Рекомендации
                      </h4>
                      <div className="text-sm" style={{ color: '#8B3A3A', opacity: 0.9 }}>
                        <FormattedAnalysis text={analytics.recommendations} />
                      </div>
                    </div>
                  )}

                  {analytics.reflection_directions && (
                    <div>
                      <h4 className="font-bold mb-2 text-sm" style={{ color: '#8B3A3A' }}>
                        🎯 Направление для размышлений
                      </h4>
                      <div className="text-sm" style={{ color: '#8B3A3A', opacity: 0.9 }}>
                        <FormattedAnalysis text={analytics.reflection_directions} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: '#8B3A3A', opacity: 0.7 }}>
                  Нет аналитики за этот месяц
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {analytics && (
        <EditAnalyticsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleAnalyticsUpdate}
          analytics={analytics}
        />
      )}
    </div>
  )
}
