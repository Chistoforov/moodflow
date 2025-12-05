'use client'

import { useState } from 'react'
import AudioRecorder from './AudioRecorder'
import AudioEntriesList from './AudioEntriesList'

interface AudioModalProps {
  date: string
  isOpen: boolean
  onClose: () => void
}

export default function AudioModal({ date, isOpen, onClose }: AudioModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('date', date)

      // Upload audio
      const response = await fetch('/api/audio-entries', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload audio')
      }

      // Trigger refresh of the list
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Не удалось загрузить аудиозапись. Попробуйте еще раз.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: 'rgba(26, 29, 46, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{
            backgroundColor: 'rgba(26, 29, 46, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            Аудиозаписи — {formatDate(date)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <svg
              width="24"
              height="24"
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
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Recorder */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onError={(message) => setUploadError(message)}
              disabled={isUploading}
            />
            
            {isUploading && (
              <div className="mt-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <div className="flex items-center justify-center gap-2">
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
                  <span>Загрузка...</span>
                </div>
              </div>
            )}

            {uploadError && (
              <div
                className="mt-4 p-3 rounded text-sm"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                {uploadError}
              </div>
            )}
          </div>

          {/* List of recordings */}
          <AudioEntriesList
            key={refreshKey}
            date={date}
            onUpdate={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </div>
    </div>
  )
}

