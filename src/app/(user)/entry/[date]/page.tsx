'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MOOD_LEVELS, FACTORS } from '@/lib/utils/constants'

// Стильная иконка настроения
const MoodSymbol = ({ score, selected }: { score: number; selected: boolean }) => {
  const symbols = [
    { symbol: '✦', size: 'text-3xl', color: '#8B3A3A' }, // 1 - очень плохо
    { symbol: '◐', size: 'text-4xl', color: '#9B4A4A' }, // 2 - плохо  
    { symbol: '○', size: 'text-4xl', color: '#A85F5F' }, // 3 - нейтрально
    { symbol: '◉', size: 'text-4xl', color: '#B87474' }, // 4 - хорошо
    { symbol: '♥', size: 'text-4xl', color: '#8B3A3A' }, // 5 - отлично
  ]
  
  const mood = symbols[score - 1] || symbols[2]
  
  return (
    <span 
      className={`${mood.size} font-serif transition-all`}
      style={{ 
        color: selected ? mood.color : '#C8BEB0',
        transform: selected ? 'scale(1.1)' : 'scale(1)'
      }}
    >
      {mood.symbol}
    </span>
  )
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

