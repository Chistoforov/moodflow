'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MOOD_LEVELS, FACTORS } from '@/lib/utils/constants'

// Погодные иконки для настроения
const MoodSymbol = ({ score, selected, size = 48 }: { score: number; selected: boolean; size?: number }) => {
  const opacity = selected ? 1 : 0.3
  const scale = selected ? 1.1 : 1
  
  const icons = [
    // 1 - очень плохо (тяжелый дождь)
    <svg key="1" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      <path d="M12 3C11.4 3 11 3.4 11 4V5C11 5.6 11.4 6 12 6C12.6 6 13 5.6 13 5V4C13 3.4 12.6 3 12 3Z" fill="#6B7280"/>
      <path d="M6 8C6.4 7.6 6.4 7 6 6.6C5.6 6.2 5 6.2 4.6 6.6L4 7.2C3.6 7.6 3.6 8.2 4 8.6C4.4 9 5 9 5.4 8.6L6 8Z" fill="#6B7280"/>
      <path d="M19.4 6.6C19 6.2 18.4 6.2 18 6.6C17.6 7 17.6 7.6 18 8L18.6 8.6C19 9 19.6 9 20 8.6C20.4 8.2 20.4 7.6 20 7.2L19.4 6.6Z" fill="#6B7280"/>
      <path d="M17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 13.2 7.4 14.3 8.1 15.2C8.3 15.5 8.4 15.8 8.4 16.2C8.4 17 7.8 17.6 7 17.6H17C16.2 17.6 15.6 17 15.6 16.2C15.6 15.8 15.7 15.5 15.9 15.2C16.6 14.3 17 13.2 17 12Z" fill="#8B3A3A" opacity="0.6"/>
      <path d="M10 19L9 21C8.8 21.4 9 21.9 9.4 22.1C9.9 22.3 10.4 22.1 10.6 21.7L11.6 19.7L10 19Z" fill="#8B3A3A"/>
      <path d="M14 19L13 21C12.8 21.4 13 21.9 13.4 22.1C13.9 22.3 14.4 22.1 14.6 21.7L15.6 19.7L14 19Z" fill="#8B3A3A"/>
      <path d="M12 19L11 21C10.8 21.4 11 21.9 11.4 22.1C11.9 22.3 12.4 22.1 12.6 21.7L13.6 19.7L12 19Z" fill="#8B3A3A"/>
    </svg>,
    // 2 - плохо (дождь)
    <svg key="2" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      <path d="M17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 13.2 7.4 14.3 8.1 15.2C8.3 15.5 8.4 15.8 8.4 16.2C8.4 17 7.8 17.6 7 17.6H17C16.2 17.6 15.6 17 15.6 16.2C15.6 15.8 15.7 15.5 15.9 15.2C16.6 14.3 17 13.2 17 12Z" fill="#9B4A4A" opacity="0.5"/>
      <path d="M10 19L9 21C8.8 21.4 9 21.9 9.4 22.1C9.9 22.3 10.4 22.1 10.6 21.7L11.6 19.7L10 19Z" fill="#9B4A4A"/>
      <path d="M14 19L13 21C12.8 21.4 13 21.9 13.4 22.1C13.9 22.3 14.4 22.1 14.6 21.7L15.6 19.7L14 19Z" fill="#9B4A4A"/>
    </svg>,
    // 3 - нейтрально (переменная облачность)
    <svg key="3" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
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
    <svg key="4" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
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
    <svg key="5" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
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

export default function EntryPage() {
  const params = useParams()
  const router = useRouter()
  const date = params.date as string

  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [textEntry, setTextEntry] = useState('')
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEntry()
  }, [date])

  const fetchEntry = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/entries')
      const data = await response.json()
      const entry = data.entries?.find((e: any) => e.entry_date === date)
      
      if (entry) {
        setMoodScore(entry.mood_score)
        setTextEntry(entry.text_entry || '')
        setSelectedFactors(entry.factors || [])
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry_date: date,
          mood_score: moodScore,
          text_entry: textEntry,
          factors: selectedFactors,
        }),
      })

      if (response.ok) {
        router.push('/calendar')
      } else {
        throw new Error('Failed to save entry')
      }
    } catch (error) {
      console.error('Failed to save entry:', error)
      alert('Ошибка при сохранении записи')
    } finally {
      setSaving(false)
    }
  }

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-0" style={{ backgroundColor: '#E8E2D5' }}>
        <div className="text-center py-12" style={{ color: '#8B3A3A' }}>Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-0" style={{ backgroundColor: '#E8E2D5' }}>
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#8B3A3A' }}>
            Запись за {date}
          </h1>
          <p className="text-lg" style={{ color: '#8B3A3A' }}>
            Как вы себя чувствуете сегодня?
          </p>
        </div>

        <div className="space-y-6">
          {/* Mood Selection */}
          <div className="rounded-2xl shadow-sm p-6 sm:p-8" style={{ backgroundColor: '#F5F1EB' }}>
            <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: '#8B3A3A' }}>
              Настроение
            </h2>
            <div className="flex justify-center flex-wrap gap-3 sm:gap-4 max-w-2xl mx-auto">
              {MOOD_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => setMoodScore(level.value)}
                  className="flex flex-col items-center p-4 sm:p-6 rounded-xl transition-all min-w-[70px] sm:min-w-[90px]"
                  style={{
                    backgroundColor: moodScore === level.value ? '#E8E2D5' : 'transparent',
                    border: moodScore === level.value ? '2px solid #8B3A3A' : '2px solid transparent',
                  }}
                >
                  <div className="mb-2 sm:mb-3 flex justify-center">
                    <MoodSymbol score={level.value} selected={moodScore === level.value} />
                  </div>
                  <div className="text-xs font-medium text-center" style={{ color: '#8B3A3A' }}>
                    {level.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Factors */}
          <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B3A3A' }}>
              Факторы
            </h2>
            <div className="flex flex-wrap gap-3">
              {FACTORS.map(factor => (
                <button
                  key={factor.value}
                  onClick={() => toggleFactor(factor.value)}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedFactors.includes(factor.value) ? '#8B3A3A' : '#E8E2D5',
                    color: selectedFactors.includes(factor.value) ? '#E8E2D5' : '#8B3A3A',
                    border: `2px solid ${selectedFactors.includes(factor.value) ? '#8B3A3A' : '#C8BEB0'}`,
                  }}
                >
                  {factor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Entry */}
          <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B3A3A' }}>
              Заметки
            </h2>
            <textarea
              value={textEntry}
              onChange={(e) => setTextEntry(e.target.value)}
              placeholder="Напишите о своих мыслях и чувствах..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: '#E8E2D5',
                color: '#8B3A3A',
                border: '2px solid #C8BEB0',
                fontFamily: 'Georgia, serif',
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push('/calendar')}
              className="px-8 py-3 rounded-full font-medium transition-all border-2"
              style={{
                color: '#8B3A3A',
                backgroundColor: 'transparent',
                borderColor: '#8B3A3A',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D4C8B5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !moodScore}
              className="px-8 py-3 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#E8E2D5',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (!saving && moodScore) {
                  e.currentTarget.style.backgroundColor = '#6B1F1F'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8B3A3A'
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

