'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MOOD_LEVELS, FACTORS } from '@/lib/utils/constants'
import AudioRecorder from '@/components/entry/AudioRecorder'
import ProcessingStatus from '@/components/entry/ProcessingStatus'

// Погодные иконки для настроения
const MoodSymbol = ({ score, selected, size = 48 }: { score: number; selected: boolean; size?: number }) => {
  const opacity = selected ? 1 : 0.3
  const scale = selected ? 1.1 : 1
  
  const icons = [
    // 1 - очень плохо (туча и молния)
    <svg key="1" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      {/* Темная туча */}
      <ellipse cx="32" cy="24" rx="18" ry="10" fill="#4A5568"/>
      <ellipse cx="22" cy="26" rx="12" ry="8" fill="#4A5568"/>
      <ellipse cx="42" cy="26" rx="12" ry="8" fill="#4A5568"/>
      {/* Молния */}
      <path d="M34 30 L30 40 L33 40 L31 50 L38 38 L35 38 L37 30 Z" fill="#FDB022"/>
    </svg>,
    // 2 - плохо (туча и дождь)
    <svg key="2" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      {/* Серая туча */}
      <ellipse cx="32" cy="22" rx="18" ry="10" fill="#718096"/>
      <ellipse cx="22" cy="24" rx="12" ry="8" fill="#718096"/>
      <ellipse cx="42" cy="24" rx="12" ry="8" fill="#718096"/>
      {/* Капли дождя */}
      <path d="M24 34 L24 42" stroke="#4299E1" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M32 36 L32 44" stroke="#4299E1" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M40 34 L40 42" stroke="#4299E1" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>,
    // 3 - нейтрально (солнце и облако)
    <svg key="3" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      {/* Солнце */}
      <circle cx="38" cy="20" r="9" fill="#FDB022"/>
      <path d="M38 8 L38 12" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M48 10 L46 14" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M52 20 L48 20" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M48 30 L46 26" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Облако */}
      <ellipse cx="28" cy="32" rx="16" ry="9" fill="#A0AEC0"/>
      <ellipse cx="18" cy="34" rx="10" ry="7" fill="#A0AEC0"/>
      <ellipse cx="38" cy="34" rx="10" ry="7" fill="#A0AEC0"/>
    </svg>,
    // 4 - хорошо (солнце)
    <svg key="4" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      {/* Солнце */}
      <circle cx="32" cy="32" r="12" fill="#FDB022"/>
      {/* Лучи */}
      <path d="M32 10 L32 16" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 48 L32 54" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M10 32 L16 32" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M48 32 L54 32" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M16 16 L20 20" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M44 44 L48 48" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M48 16 L44 20" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
      <path d="M20 44 L16 48" stroke="#FDB022" strokeWidth="3" strokeLinecap="round"/>
    </svg>,
    // 5 - очень хорошо (солнце и нотка)
    <svg key="5" width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s' }}>
      {/* Солнце */}
      <circle cx="28" cy="28" r="11" fill="#FDB022"/>
      {/* Лучи */}
      <path d="M28 8 L28 14" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 42 L28 48" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 28 L14 28" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M42 28 L48 28" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 14 L18 18" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M38 38 L42 42" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M42 14 L38 18" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 38 L14 42" stroke="#FDB022" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Нотка */}
      <ellipse cx="48" cy="44" rx="4" ry="3" fill="#8B3A3A"/>
      <rect x="51.5" y="28" width="2.5" height="16" fill="#8B3A3A"/>
      <path d="M54 28 Q58 26 58 30 L58 38" stroke="#8B3A3A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | null>(null)
  const [uploading, setUploading] = useState(false)

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
        setAudioUrl(entry.audio_url)
        setProcessingStatus(entry.processing_status)
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

  const handleAudioRecording = async (audioBlob: Blob) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('date', date)

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAudioUrl(data.audioUrl)
        setProcessingStatus('pending')
        
        // Poll for status updates
        pollProcessingStatus()
      } else {
        throw new Error('Failed to upload audio')
      }
    } catch (error) {
      console.error('Failed to upload audio:', error)
      alert('Ошибка при загрузке аудио')
    } finally {
      setUploading(false)
    }
  }

  const pollProcessingStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/entries')
        const data = await response.json()
        const entry = data.entries?.find((e: any) => e.entry_date === date)
        
        if (entry) {
          setProcessingStatus(entry.processing_status)
          
          // Stop polling if completed or failed
          if (entry.processing_status === 'completed' || entry.processing_status === 'failed') {
            clearInterval(pollInterval)
            
            // Update text if transcription completed
            if (entry.processing_status === 'completed' && entry.text_entry) {
              setTextEntry(entry.text_entry)
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll status:', error)
      }
    }, 3000) // Poll every 3 seconds

    // Clear interval after 5 minutes max
    setTimeout(() => clearInterval(pollInterval), 300000)
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
            
            {/* Processing Status */}
            <ProcessingStatus status={processingStatus} className="mb-4" />
            
            {/* Audio Recorder */}
            <div className="mb-6">
              <AudioRecorder 
                onRecordingComplete={handleAudioRecording}
                disabled={uploading || processingStatus === 'processing'}
              />
              {uploading && (
                <div className="text-center mt-3" style={{ color: '#8B3A3A' }}>
                  Загрузка...
                </div>
              )}
              {audioUrl && (
                <div className="mt-4">
                  <audio 
                    controls 
                    src={audioUrl}
                    className="w-full"
                    style={{
                      filter: 'sepia(50%) hue-rotate(320deg) saturate(70%)',
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <textarea
                value={textEntry}
                onChange={(e) => setTextEntry(e.target.value)}
                placeholder="Запишите аудио или напишите о своих мыслях и чувствах"
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
              disabled={saving || (!moodScore && !textEntry.trim())}
              className="px-8 py-3 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#E8E2D5',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (!saving && (moodScore || textEntry.trim())) {
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

