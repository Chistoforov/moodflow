'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MOOD_LEVELS, FACTORS } from '@/lib/utils/constants'

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
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div className="px-4 sm:px-0 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Запись за {date}</h1>
        <p className="mt-2 text-gray-600">Как вы себя чувствуете сегодня?</p>
      </div>

      <div className="space-y-6">
        {/* Mood Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Настроение</h2>
          <div className="flex justify-between gap-2">
            {MOOD_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => setMoodScore(level.value)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  moodScore === level.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">{level.emoji}</div>
                <div className="text-sm font-medium">{level.value}/5</div>
              </button>
            ))}
          </div>
        </div>

        {/* Factors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Факторы</h2>
          <div className="flex flex-wrap gap-2">
            {FACTORS.map(factor => (
              <button
                key={factor.value}
                onClick={() => toggleFactor(factor.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFactors.includes(factor.value)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {factor.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Entry */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Заметки</h2>
          <textarea
            value={textEntry}
            onChange={(e) => setTextEntry(e.target.value)}
            placeholder="Напишите о своих мыслях и чувствах..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push('/calendar')}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !moodScore}
            className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

