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
    // 1 - очень плохо (тяжелый дождь с темной тучей)
    <svg key="1" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M46 28C46 26.5 45.5 25 44.5 24C43 21.5 40 20 37 20C36.5 20 36 20 35.5 20.2C34.5 16 30.5 13 26 13C21 13 17 17 17 22C17 22.2 17 22.5 17 22.8C14 23.5 12 26.5 12 30C12 34.5 15.5 38 20 38H44C48.5 38 52 34.5 52 30C52 29 51.5 28.5 51 28C49.5 28 47.5 28 46 28Z" fill="#5A6B7D"/>
      <rect x="20" y="42" width="2" height="6" rx="1" fill="#4A5A6D"/>
      <rect x="26" y="42" width="2" height="6" rx="1" fill="#4A5A6D"/>
      <rect x="32" y="42" width="2" height="6" rx="1" fill="#4A5A6D"/>
      <rect x="38" y="42" width="2" height="6" rx="1" fill="#4A5A6D"/>
      <rect x="44" y="42" width="2" height="6" rx="1" fill="#4A5A6D"/>
      <rect x="23" y="50" width="2" height="4" rx="1" fill="#4A5A6D"/>
      <rect x="29" y="50" width="2" height="4" rx="1" fill="#4A5A6D"/>
      <rect x="35" y="50" width="2" height="4" rx="1" fill="#4A5A6D"/>
      <rect x="41" y="50" width="2" height="4" rx="1" fill="#4A5A6D"/>
    </svg>,
    // 2 - плохо (дождь с серой тучей)
    <svg key="2" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M46 28C46 26.5 45.5 25 44.5 24C43 21.5 40 20 37 20C36.5 20 36 20 35.5 20.2C34.5 16 30.5 13 26 13C21 13 17 17 17 22C17 22.2 17 22.5 17 22.8C14 23.5 12 26.5 12 30C12 34.5 15.5 38 20 38H44C48.5 38 52 34.5 52 30C52 29 51.5 28.5 51 28C49.5 28 47.5 28 46 28Z" fill="#8B9AA8"/>
      <rect x="22" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
      <rect x="28" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
      <rect x="34" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
      <rect x="40" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
    </svg>,
    // 3 - нейтрально (облачно)
    <svg key="3" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M46 28C46 26.5 45.5 25 44.5 24C43 21.5 40 20 37 20C36.5 20 36 20 35.5 20.2C34.5 16 30.5 13 26 13C21 13 17 17 17 22C17 22.2 17 22.5 17 22.8C14 23.5 12 26.5 12 30C12 34.5 15.5 38 20 38H44C48.5 38 52 34.5 52 30C52 29 51.5 28.5 51 28C49.5 28 47.5 28 46 28Z" fill="#B8C5D6"/>
    </svg>,
    // 4 - хорошо (частично облачно)
    <svg key="4" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="38" cy="20" r="8" fill="#FDB022"/>
      <path d="M38 8V10" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38 30V32" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M48.5 9.5L47.1 10.9" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M28.9 29.1L27.5 30.5" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M50 20H52" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 20H26" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M48.5 30.5L47.1 29.1" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M28.9 10.9L27.5 9.5" stroke="#FDB022" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38 32C38 30.5 37.5 29 36.5 28C35 25.5 32 24 29 24C28.5 24 28 24 27.5 24.2C26.5 22 24 20 21 20C17.5 20 15 22.5 15 26C15 26.2 15 26.4 15 26.6C13 27.2 11.5 29 11.5 31.5C11.5 34.5 14 37 17 37H35C38 37 40.5 34.5 40.5 31.5C40.5 31 40.3 30.5 40 30C39.5 30 38.5 30 38 30V32Z" fill="#E8F0F8"/>
    </svg>,
    // 5 - отлично (солнечно)
    <svg key="5" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="12" fill="#FDB022"/>
      <path d="M32 8V14" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 50V56" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M50.9 13.1L46.6 17.4" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M17.4 46.6L13.1 50.9" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M56 32H50" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M14 32H8" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M50.9 50.9L46.6 46.6" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M17.4 17.4L13.1 13.1" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
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
    <div className="min-h-screen px-2 sm:px-4 pt-4 pb-20" style={{ backgroundColor: '#E8E2D5' }}>
      <div className="max-w-2xl mx-auto">
        {/* Компактный заголовок с месяцем, годом и навигацией */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-2 sm:px-4">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-all rounded-full border-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
          
          <div className="text-center px-2">
            <h1 
              className="handwritten text-3xl sm:text-4xl"
              style={{ color: '#8B3A3A' }}
            >
              {format(currentMonth, 'LLLL', { locale: ru })}
            </h1>
            <p 
              className="text-lg sm:text-xl font-semibold mt-1"
              style={{ color: '#8B3A3A', opacity: 0.8 }}
            >
              {format(currentMonth, 'yyyy')}
            </p>
          </div>

          <button
            onClick={() => changeMonth(1)}
            className="px-4 sm:px-6 py-2 text-base sm:text-lg font-medium transition-all rounded-full border-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
        <div className="rounded-2xl p-4 sm:p-6 md:p-8" style={{ backgroundColor: '#E8E2D5' }}>
          {isLoading ? (
            <div className="text-center py-12" style={{ color: '#8B3A3A' }}>
              Загрузка...
            </div>
          ) : (
            <>
              {/* Дни недели */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                {['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'].map((day, index) => (
                  <div 
                    key={day} 
                    className="text-center font-semibold text-xs sm:text-sm uppercase tracking-wider"
                    style={{ color: '#8B3A3A' }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Дни месяца */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                {/* Пустые клетки для выравнивания */}
                {Array.from({ length: emptyDays }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                
                {days.map(day => {
                  const entry = getEntryForDate(day)
                  const today = isToday(day)
                  const dateStr = format(day, 'yyyy-MM-dd')

                  return (
                    <div
                      key={day.toString()}
                      className="aspect-square relative"
                    >
                      <a
                        href={`/entry/${dateStr}`}
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all"
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
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Аналитика и рекомендации */}
        <div className="mt-4 sm:mt-6 rounded-2xl p-4 sm:p-6" style={{ backgroundColor: '#F5F1EB' }}>
          <h3 
            className="font-semibold mb-4 text-base sm:text-lg text-center"
            style={{ color: '#8B3A3A' }}
          >
            Аналитика и рекомендации
          </h3>
          <div 
            className="text-center p-3 sm:p-4 rounded-lg"
            style={{ 
              color: '#8B3A3A',
              backgroundColor: '#E8E2D5',
              opacity: 0.8
            }}
          >
            <p className="text-sm sm:text-base leading-relaxed">
              Продолжайте заполнять дневник и скоро вы сможете увидеть выводы и рекомендации
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

