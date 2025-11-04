'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MOOD_LEVELS, FACTORS } from '@/lib/utils/constants'

// Погодные иконки для настроения
const MoodSymbol = ({ score, selected, size = 48 }: { score: number; selected: boolean; size?: number }) => {
  const opacity = selected ? 1 : 0.3
  const scale = selected ? 1.1 : 1
  
  const icons = [
    // 1 - очень плохо (тяжелый дождь с темной тучей)
    <svg key="1" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
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
    <svg key="2" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      <path d="M46 28C46 26.5 45.5 25 44.5 24C43 21.5 40 20 37 20C36.5 20 36 20 35.5 20.2C34.5 16 30.5 13 26 13C21 13 17 17 17 22C17 22.2 17 22.5 17 22.8C14 23.5 12 26.5 12 30C12 34.5 15.5 38 20 38H44C48.5 38 52 34.5 52 30C52 29 51.5 28.5 51 28C49.5 28 47.5 28 46 28Z" fill="#8B9AA8"/>
      <rect x="22" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
      <rect x="28" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
      <rect x="34" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
      <rect x="40" y="42" width="2" height="6" rx="1" fill="#6B7A88"/>
    </svg>,
    // 3 - нейтрально (облачно)
    <svg key="3" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      <path d="M46 28C46 26.5 45.5 25 44.5 24C43 21.5 40 20 37 20C36.5 20 36 20 35.5 20.2C34.5 16 30.5 13 26 13C21 13 17 17 17 22C17 22.2 17 22.5 17 22.8C14 23.5 12 26.5 12 30C12 34.5 15.5 38 20 38H44C48.5 38 52 34.5 52 30C52 29 51.5 28.5 51 28C49.5 28 47.5 28 46 28Z" fill="#B8C5D6"/>
    </svg>,
    // 4 - хорошо (частично облачно)
    <svg key="4" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
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
    <svg key="5" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
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

