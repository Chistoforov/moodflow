'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ArrowLeft, Edit2, Save, X } from 'lucide-react'
import SuccessModal from '@/components/shared/SuccessModal'
import ErrorModal from '@/components/entry/ErrorModal'

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

interface MonthlyAnalytics {
  id: string
  year: number
  month: number
  week_number: number
  days_analyzed: number
  analysis_text: string
  general_impression: string | null
  positive_trends: string | null
  decline_reasons: string | null
  recommendations: string | null
  reflection_directions: string | null
  is_final: boolean
  status: string
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)

  // Analytics state
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null)
  const [hasAnalytics, setHasAnalytics] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editedAnalytics, setEditedAnalytics] = useState({
    general_impression: '',
    positive_trends: '',
    decline_reasons: '',
    recommendations: '',
    reflection_directions: ''
  })

  // Modal states
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' })

  useEffect(() => {
    if (userId) {
      fetchUserEntries()
      fetchAnalytics()
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

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      
      const response = await fetch(
        `/api/admin/users/${userId}/analytics?year=${currentYear}&month=${currentMonth}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const result = await response.json()
      setAnalytics(result.analytics)
      setHasAnalytics(result.hasAnalytics)
      
      if (result.analytics) {
        setEditedAnalytics({
          general_impression: result.analytics.general_impression || '',
          positive_trends: result.analytics.positive_trends || '',
          decline_reasons: result.analytics.decline_reasons || '',
          recommendations: result.analytics.recommendations || '',
          reflection_directions: result.analytics.reflection_directions || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const generateAnalytics = async () => {
    try {
      setIsGenerating(true)
      
      const response = await fetch(
        `/api/admin/users/${userId}/analytics/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: currentYear, month: currentMonth })
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate analytics')
      }
      
      const result = await response.json()
      setSuccessModal({
        isOpen: true,
        message: result.isFinal 
          ? 'Финальная аналитика месяца успешно сгенерирована!' 
          : `Аналитика за ${result.weekNumber} неделю (${result.daysAnalyzed} дней) успешно сгенерирована!`
      })
      
      await fetchAnalytics()
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Произошла ошибка при генерации аналитики'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const saveAnalytics = async () => {
    if (!analytics) return
    
    try {
      const response = await fetch(
        `/api/admin/users/${userId}/analytics`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analyticsId: analytics.id,
            ...editedAnalytics
          })
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to save analytics')
      }
      
      await fetchAnalytics()
      setIsEditing(false)
      setSuccessModal({
        isOpen: true,
        message: 'Аналитика успешно обновлена!'
      })
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Произошла ошибка при сохранении'
      })
    }
  }

  const cancelEditing = () => {
    if (analytics) {
      setEditedAnalytics({
        general_impression: analytics.general_impression || '',
        positive_trends: analytics.positive_trends || '',
        decline_reasons: analytics.decline_reasons || '',
        recommendations: analytics.recommendations || '',
        reflection_directions: analytics.reflection_directions || ''
      })
    }
    setIsEditing(false)
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
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
        >
          <ArrowLeft size={20} />
          <span>Назад к списку пользователей</span>
        </button>

        <div className="rounded-2xl shadow-sm p-8 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'rgba(255, 255, 255, 0.9)' }}></div>
          <p className="mt-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Загрузка данных...</p>
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
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
        >
          <ArrowLeft size={20} />
          <span>Назад к списку пользователей</span>
        </button>

        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{error || 'Не удалось загрузить данные'}</p>
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
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
      >
        <ArrowLeft size={20} />
        <span>Назад к списку пользователей</span>
      </button>

      {/* Header with user name and month navigation */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {data.user.full_name || data.user.email}
          </h1>
          {data.user.full_name && (
            <p className="mt-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', opacity: 0.7 }}>
              {data.user.email}
            </p>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center min-w-[160px]">
            <div className="text-xl font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {MONTH_NAMES[currentMonth - 1]}
            </div>
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', opacity: 0.7 }}>
              {currentYear}
            </div>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
            aria-label="Следующий месяц"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Main content: Table + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entries table */}
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <tr>
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    Дата
                  </th>
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    Настроение
                  </th>
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    Факторы
                  </th>
                  <th
                    className="px-3 py-3 text-left text-xs font-semibold"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    Описание
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                {data.entries.map((entry) => (
                  <tr
                    key={entry.date}
                    className="hover:bg-opacity-50 transition-colors"
                    style={{ 
                      backgroundColor: entry.has_entries ? 'transparent' : 'rgba(217, 207, 191, 0.2)',
                      opacity: entry.has_entries ? 1 : 0.6
                    }}
                  >
                    <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {entry.day} {MONTH_NAMES[currentMonth - 1].substring(0, 3).toLowerCase()}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {entry.mood_score !== null ? (
                        <div className="flex items-center gap-1">
                          <span>{MOOD_LABELS[entry.mood_score]}</span>
                          <span className="text-xs opacity-70">({entry.mood_score})</span>
                        </div>
                      ) : (
                        <span className="text-xs opacity-50">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {entry.factors.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {entry.factors.map((factor, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              {FACTOR_LABELS[factor] || factor}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs opacity-50">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {entry.text ? (
                        <div className="whitespace-pre-wrap line-clamp-3">
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
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', opacity: 0.7 }}>
                Нет записей за этот месяц
              </p>
            </div>
          )}
        </div>

        {/* Analytics panel */}
        <div className="rounded-2xl shadow-sm p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Аналитика и рекомендации
            </h2>
            {hasAnalytics && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
                title="Редактировать"
              >
                <Edit2 size={18} />
              </button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={saveAnalytics}
                  className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                  style={{ backgroundColor: '#7c5cff', color: '#ffffff' }}
                  title="Сохранить"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={cancelEditing}
                  className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.9)' }}
                  title="Отменить"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'rgba(255, 255, 255, 0.9)' }}></div>
            </div>
          ) : !hasAnalytics ? (
            <div className="text-center py-8">
              <p className="mb-4 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Аналитика еще не создана
              </p>
              <button
                onClick={generateAnalytics}
                disabled={isGenerating}
                className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: '#7c5cff', color: '#ffffff' }}
              >
                {isGenerating ? 'Генерация...' : 'Получить рекомендации'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Generate/Update button */}
              <button
                onClick={generateAnalytics}
                disabled={isGenerating}
                className="w-full px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                style={{ backgroundColor: '#7c5cff', color: '#ffffff' }}
              >
                {isGenerating ? 'Обновление...' : 'Обновить рекомендации'}
              </button>

              {/* Analytics content */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Общее впечатление о периоде
                      </label>
                      <textarea
                        value={editedAnalytics.general_impression}
                        onChange={(e) => setEditedAnalytics({ ...editedAnalytics, general_impression: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          color: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        ✨ Положительные тенденции
                      </label>
                      <textarea
                        value={editedAnalytics.positive_trends}
                        onChange={(e) => setEditedAnalytics({ ...editedAnalytics, positive_trends: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          color: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        🔍 Возможные причины спада
                      </label>
                      <textarea
                        value={editedAnalytics.decline_reasons}
                        onChange={(e) => setEditedAnalytics({ ...editedAnalytics, decline_reasons: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          color: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        💡 Рекомендации и техники
                      </label>
                      <textarea
                        value={editedAnalytics.recommendations}
                        onChange={(e) => setEditedAnalytics({ ...editedAnalytics, recommendations: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          color: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        🎯 Направление для размышлений
                      </label>
                      <textarea
                        value={editedAnalytics.reflection_directions}
                        onChange={(e) => setEditedAnalytics({ ...editedAnalytics, reflection_directions: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                          color: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {analytics?.general_impression && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          Общее впечатление о периоде
                        </h4>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {analytics.general_impression}
                        </p>
                      </div>
                    )}

                    {analytics?.positive_trends && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          ✨ Положительные тенденции
                        </h4>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {analytics.positive_trends}
                        </p>
                      </div>
                    )}

                    {analytics?.decline_reasons && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          🔍 Возможные причины спада
                        </h4>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {analytics.decline_reasons}
                        </p>
                      </div>
                    )}

                    {analytics?.recommendations && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          💡 Рекомендации и техники
                        </h4>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {analytics.recommendations}
                        </p>
                      </div>
                    )}

                    {analytics?.reflection_directions && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-xs font-semibold mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          🎯 Направление для размышлений
                        </h4>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {analytics.reflection_directions}
                        </p>
                      </div>
                    )}

                    {analytics && (
                      <div className="text-center pt-2">
                        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Неделя {analytics.week_number} • {analytics.days_analyzed} {analytics.days_analyzed === 1 ? 'день' : analytics.days_analyzed < 5 ? 'дня' : 'дней'}
                          {analytics.is_final && ' • Финальная аналитика'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </div>
  )
}

