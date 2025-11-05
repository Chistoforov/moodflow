'use client'

import { useState } from 'react'
import useSWR from 'swr'

interface AudioEntry {
  id: string
  entry_date: string
  audio_url: string
  audio_duration: number | null
  transcript: string | null
  processing_status: 'pending' | 'processing' | 'completed' | 'failed' | null
  created_at: string
}

interface AudioEntriesListProps {
  date: string
  onUpdate?: () => void
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AudioEntriesList({ date, onUpdate }: AudioEntriesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, error, mutate } = useSWR(
    `/api/audio-entries?date=${date}`,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds to check transcription status
      revalidateOnFocus: true,
    }
  )

  const audioEntries: AudioEntry[] = data?.audioEntries || []
  const isLoading = !data && !error

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту аудиозапись?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/audio-entries?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete audio entry')
      }

      // Update the cache
      mutate()
      onUpdate?.()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Не удалось удалить запись. Попробуйте еще раз.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusText = (status: AudioEntry['processing_status']) => {
    switch (status) {
      case 'pending':
        return 'Ожидает расшифровки...'
      case 'processing':
        return 'Расшифровка в процессе...'
      case 'completed':
        return 'Расшифровано'
      case 'failed':
        return 'Ошибка расшифровки'
      default:
        return ''
    }
  }

  const getStatusColor = (status: AudioEntry['processing_status']) => {
    switch (status) {
      case 'pending':
        return '#FDB022'
      case 'processing':
        return '#4A90E2'
      case 'completed':
        return '#7ED321'
      case 'failed':
        return '#D0021B'
      default:
        return '#8B3A3A'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-4" style={{ color: '#8B3A3A' }}>
        Загрузка...
      </div>
    )
  }

  if (audioEntries.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold text-lg" style={{ color: '#8B3A3A' }}>
        Аудиозаписи ({audioEntries.length})
      </h3>
      
      <div className="space-y-3">
        {audioEntries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg p-4 border-2"
            style={{
              backgroundColor: '#F5F1EB',
              borderColor: '#D4C8B5',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Audio player */}
                <audio
                  controls
                  className="w-full mb-2"
                  style={{ maxHeight: '40px' }}
                >
                  <source src={entry.audio_url} type="audio/webm" />
                  <source src={entry.audio_url} type="audio/mpeg" />
                  Ваш браузер не поддерживает аудио.
                </audio>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-sm mb-2">
                  <span style={{ color: '#8B3A3A', opacity: 0.7 }}>
                    {formatDate(entry.created_at)}
                  </span>
                  {entry.audio_duration && (
                    <span style={{ color: '#8B3A3A', opacity: 0.7 }}>
                      • {formatTime(entry.audio_duration)}
                    </span>
                  )}
                </div>

                {/* Status */}
                {entry.processing_status && (
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getStatusColor(entry.processing_status),
                      }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: getStatusColor(entry.processing_status) }}
                    >
                      {getStatusText(entry.processing_status)}
                    </span>
                  </div>
                )}

                {/* Transcript */}
                {entry.transcript && entry.processing_status === 'completed' && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === entry.id ? null : entry.id)
                      }
                      className="text-sm font-medium underline"
                      style={{ color: '#8B3A3A' }}
                    >
                      {expandedId === entry.id
                        ? 'Скрыть расшифровку'
                        : 'Показать расшифровку'}
                    </button>
                    
                    {expandedId === entry.id && (
                      <div
                        className="mt-2 p-3 rounded text-sm leading-relaxed"
                        style={{
                          backgroundColor: '#E8E2D5',
                          color: '#8B3A3A',
                        }}
                      >
                        {entry.transcript}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="flex-shrink-0 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#E8E2D5',
                  color: '#8B3A3A',
                  border: '2px solid #C8BEB0',
                }}
                title="Удалить запись"
                onMouseEnter={(e) => {
                  if (deletingId !== entry.id) {
                    e.currentTarget.style.backgroundColor = '#D4C8B5'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#E8E2D5'
                }}
              >
                {deletingId === entry.id ? (
                  <svg
                    className="animate-spin"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

