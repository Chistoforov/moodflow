'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MOOD_LEVELS } from '@/lib/utils/constants'
import useSWR from 'swr'

interface Entry {
  id: string
  entry_date: string
  mood_score: number | null
}

// Fetcher функция для SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

// Погодные иконки для настроения
const MoodSymbol = ({ score, size = 24 }: { score: number; size?: number }) => {
  const icons = [
    // 1 - очень плохо (тяжелый дождь)
    <svg key="1" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C11.4 3 11 3.4 11 4V5C11 5.6 11.4 6 12 6C12.6 6 13 5.6 13 5V4C13 3.4 12.6 3 12 3Z" fill="#6B7280"/>
      <path d="M6 8C6.4 7.6 6.4 7 6 6.6C5.6 6.2 5 6.2 4.6 6.6L4 7.2C3.6 7.6 3.6 8.2 4 8.6C4.4 9 5 9 5.4 8.6L6 8Z" fill="#6B7280"/>
      <path d="M19.4 6.6C19 6.2 18.4 6.2 18 6.6C17.6 7 17.6 7.6 18 8L18.6 8.6C19 9 19.6 9 20 8.6C20.4 8.2 20.4 7.6 20 7.2L19.4 6.6Z" fill="#6B7280"/>
      <path d="M17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 13.2 7.4 14.3 8.1 15.2C8.3 15.5 8.4 15.8 8.4 16.2C8.4 17 7.8 17.6 7 17.6H17C16.2 17.6 15.6 17 15.6 16.2C15.6 15.8 15.7 15.5 15.9 15.2C16.6 14.3 17 13.2 17 12Z" fill="#8B3A3A" opacity="0.6"/>
      <path d="M10 19L9 21C8.8 21.4 9 21.9 9.4 22.1C9.9 22.3 10.4 22.1 10.6 21.7L11.6 19.7L10 19Z" fill="#8B3A3A"/>
      <path d="M14 19L13 21C12.8 21.4 13 21.9 13.4 22.1C13.9 22.3 14.4 22.1 14.6 21.7L15.6 19.7L14 19Z" fill="#8B3A3A"/>
      <path d="M12 19L11 21C10.8 21.4 11 21.9 11.4 22.1C11.9 22.3 12.4 22.1 12.6 21.7L13.6 19.7L12 19Z" fill="#8B3A3A"/>
    </svg>,
    // 2 - плохо (дождь)
    <svg key="2" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 13.2 7.4 14.3 8.1 15.2C8.3 15.5 8.4 15.8 8.4 16.2C8.4 17 7.8 17.6 7 17.6H17C16.2 17.6 15.6 17 15.6 16.2C15.6 15.8 15.7 15.5 15.9 15.2C16.6 14.3 17 13.2 17 12Z" fill="#9B4A4A" opacity="0.5"/>
      <path d="M10 19L9 21C8.8 21.4 9 21.9 9.4 22.1C9.9 22.3 10.4 22.1 10.6 21.7L11.6 19.7L10 19Z" fill="#9B4A4A"/>
      <path d="M14 19L13 21C12.8 21.4 13 21.9 13.4 22.1C13.9 22.3 14.4 22.1 14.6 21.7L15.6 19.7L14 19Z" fill="#9B4A4A"/>
    </svg>,
    // 3 - нейтрально (переменная облачность)
    <svg key="3" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="10" r="3" fill="#FDB022" opacity="0.8"/>
      <path d="M12 5V6" stroke="#FDB022" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 14V15" stroke="#FDB022" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16.24 7.76L15.54 8.46" stroke="#FDB022" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8.46 15.54L7.76 16.24" stroke="#FDB022" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 10H17" stroke="#FDB022" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 10H6" stroke="#FDB022" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19 16C19 14.3 17.7 13 16 13C15.7 13 15.4 13.1 15.2 13.1C14.8 11.8 13.5 11 12 11C10.3 11 9 12.3 9 14C9 14.1 9 14.2 9 14.3C7.8 14.6 7 15.7 7 17C7 18.7 8.3 20 10 20H17C18.1 20 19 19.1 19 18V16Z" fill="#A85F5F" opacity="0.4"/>
    </svg>,
    // 4 - хорошо (преимущественно солнечно)
    <svg key="4" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="11" r="4" fill="#FDB022"/>
      <path d="M12 4V5" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 17V18" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17.66 6.34L16.95 7.05" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7.05 16.95L6.34 17.66" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 11H19" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 11H4" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17.66 15.66L16.95 14.95" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7.05 7.05L6.34 6.34" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 18C19 17.4 18.8 16.9 18.5 16.5C18.3 16.2 17.9 16 17.5 16C17.3 16 17.1 16 16.9 16.1C16.6 15.5 16 15 15.2 15C14.5 15 13.9 15.4 13.6 16H10C9.4 16 9 16.4 9 17C9 18.7 10.3 20 12 20H17C18.1 20 19 19.1 19 18Z" fill="#B87474" opacity="0.3"/>
    </svg>,
    // 5 - отлично (солнечно)
    <svg key="5" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" fill="#FDB022"/>
      <path d="M12 2V4" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 20V22" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M19.78 4.22L18.36 5.64" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M5.64 18.36L4.22 19.78" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22 12H20" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M4 12H2" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M19.78 19.78L18.36 18.36" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M5.64 5.64L4.22 4.22" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ]
  
  return <div className="flex items-center justify-center">{icons[score - 1] || icons[2]}</div>
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Используем SWR для кеширования данных
  const { data, isLoading } = useSWR('/api/entries', fetcher, {
    revalidateOnFocus: false, // Не перезагружать при фокусе
    revalidateOnReconnect: false, // Не перезагружать при реконнекте
    dedupingInterval: 60000, // Дедупликация запросов в течение 60 секунд
  })
  
  const entries: Entry[] = data?.entries || []

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
          {isLoading ? (
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
        <div className="mt-6 pb-20 rounded-2xl p-6" style={{ backgroundColor: '#F5F1EB' }}>
          <h3 
            className="font-semibold mb-6 text-lg text-center"
            style={{ color: '#8B3A3A' }}
          >
            Настроение
          </h3>
          <div className="flex flex-col gap-4">
            {/* Текст по краям */}
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-medium" style={{ color: '#8B3A3A' }}>
                очень плохое
              </span>
              <span className="text-sm font-medium" style={{ color: '#8B3A3A' }}>
                Очень хорошее
              </span>
            </div>
            {/* Иконки в центре */}
            <div className="flex justify-center items-center gap-8">
              {[1, 2, 3, 4, 5].map(score => (
                <div key={score}>
                  <MoodSymbol score={score} size={32} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

