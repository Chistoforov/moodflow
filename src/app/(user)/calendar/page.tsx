'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_LEVELS } from '@/lib/utils/constants'

interface Entry {
  id: string
  entry_date: string
  mood_score: number | null
}

// Стильная иконка настроения
const MoodSymbol = ({ score }: { score: number }) => {
  const symbols = [
    { symbol: '✦', size: 'text-lg', color: '#8B3A3A' }, // 1 - очень плохо
    { symbol: '◐', size: 'text-xl', color: '#9B4A4A' }, // 2 - плохо  
    { symbol: '○', size: 'text-xl', color: '#A85F5F' }, // 3 - нейтрально
    { symbol: '◉', size: 'text-xl', color: '#B87474' }, // 4 - хорошо
    { symbol: '♥', size: 'text-xl', color: '#8B3A3A' }, // 5 - отлично
  ]
  
  const mood = symbols[score - 1] || symbols[2]
  
  return (
    <span 
      className={`${mood.size} font-serif`}
      style={{ color: mood.color }}
    >
      {mood.symbol}
    </span>
  )
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
  
  // Добавляем пустые клетки в начало для выравнивания по дням недели
  const firstDayOfWeek = getDay(monthStart)
  const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return entries.find(e => e.entry_date === dateStr)
  }

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + increment)
    setCurrentMonth(newDate)
  }

  return (
    <div className="min-h-screen px-4 sm:px-0 pt-4" style={{ backgroundColor: '#E8E2D5' }}>
      <div className="max-w-2xl mx-auto">
        {/* Компактный заголовок с месяцем, годом и навигацией */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button
            onClick={() => changeMonth(-1)}
            className="px-6 py-2 text-base font-medium transition-all rounded-full border-2"
            style={{ 
              color: '#8B3A3A',
              borderColor: '#8B3A3A',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8B3A3A'
              e.currentTarget.style.color = '#E8E2D5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#8B3A3A'
            }}
          >
            ←
          </button>
          
          <div className="text-center">
            <h1 
              className="handwritten text-4xl"
              style={{ color: '#8B3A3A' }}
            >
              {format(currentMonth, 'LLLL', { locale: ru })}
            </h1>
            <p 
              className="text-xl font-semibold mt-1"
              style={{ color: '#8B3A3A', opacity: 0.8 }}
            >
              {format(currentMonth, 'yyyy')}
            </p>
          </div>

          <button
            onClick={() => changeMonth(1)}
            className="px-6 py-2 text-base font-medium transition-all rounded-full border-2"
            style={{ 
              color: '#8B3A3A',
              borderColor: '#8B3A3A',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8B3A3A'
              e.currentTarget.style.color = '#E8E2D5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#8B3A3A'
            }}
          >
            →
          </button>
        </div>

        {/* Календарь */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#E8E2D5' }}>
          {loading ? (
            <div className="text-center py-12" style={{ color: '#8B3A3A' }}>
              Загрузка...
            </div>
          ) : (
            <>
              {/* Дни недели */}
              <div className="grid grid-cols-7 gap-4 mb-6">
                {['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'].map((day, index) => (
                  <div 
                    key={day} 
                    className="text-center font-semibold text-sm uppercase tracking-wider"
                    style={{ color: '#8B3A3A' }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Дни месяца */}
              <div className="grid grid-cols-7 gap-4">
                {/* Пустые клетки для выравнивания */}
                {Array.from({ length: emptyDays }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                
                {days.map(day => {
                  const entry = getEntryForDate(day)
                  const today = isToday(day)

                  return (
                    <a
                      key={day.toString()}
                      href={`/entry/${format(day, 'yyyy-MM-dd')}`}
                      className="aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative"
                      style={{
                        backgroundColor: today ? '#D4C8B5' : 'transparent',
                        border: today ? '2px solid #8B3A3A' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!today) {
                          e.currentTarget.style.backgroundColor = '#D4C8B5'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!today) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div 
                        className="text-lg font-medium mb-1"
                        style={{ color: '#8B3A3A' }}
                      >
                        {format(day, 'd')}
                      </div>
                      {entry && entry.mood_score && (
                        <div className="flex justify-center">
                          <MoodSymbol score={entry.mood_score} />
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Легенда */}
        <div className="mt-6 mb-4 rounded-2xl p-6" style={{ backgroundColor: '#F5F1EB' }}>
          <h3 
            className="font-semibold mb-4 text-lg"
            style={{ color: '#8B3A3A' }}
          >
            Легенда настроения
          </h3>
          <div className="flex flex-wrap gap-6">
            {MOOD_LEVELS.map(level => (
              <div key={level.value} className="flex items-center gap-3">
                <MoodSymbol score={level.value} />
                <span className="text-sm" style={{ color: '#8B3A3A' }}>
                  {level.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

