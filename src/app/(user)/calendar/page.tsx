'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_LEVELS } from '@/lib/utils/constants'

interface Entry {
  id: string
  entry_date: string
  mood_score: number | null
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [currentMonth])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return entries.find(e => e.entry_date === dateStr)
  }

  const getMoodIcon = (moodScore: number | null) => {
    if (!moodScore) return null
    const mood = MOOD_LEVELS.find(m => m.value === moodScore)
    return mood ? mood.Icon : null
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Календарь настроения</h1>
        <p className="mt-2 text-gray-600">
          Отслеживайте свое настроение каждый день
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Назад
          </button>
          <h2 className="text-xl font-semibold capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Вперед
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="text-center font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {days.map(day => {
              const entry = getEntryForDate(day)
              const MoodIcon = entry ? getMoodIcon(entry.mood_score) : null
              const today = isToday(day)

              return (
                <a
                  key={day.toString()}
                  href={`/entry/${format(day, 'yyyy-MM-dd')}`}
                  className={`
                    aspect-square p-2 text-center rounded-lg border
                    ${today ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}
                    ${entry ? 'bg-gray-50' : 'bg-white'}
                    hover:bg-gray-100 transition-colors
                  `}
                >
                  <div className="text-sm text-gray-700">{format(day, 'd')}</div>
                  {MoodIcon && (
                    <div className="mt-1 flex justify-center">
                      <MoodIcon className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Легенда</h3>
        <div className="flex flex-wrap gap-4">
          {MOOD_LEVELS.map(level => (
            <div key={level.value} className="flex items-center gap-2">
              <level.Icon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">{level.value}/5</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

