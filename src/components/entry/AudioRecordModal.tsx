'use client'

import { useState } from 'react'
import AudioRecorder from './AudioRecorder'

interface AudioRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
}

export default function AudioRecordModal({ 
  isOpen, 
  onClose, 
  onRecordingComplete,
  disabled = false
}: AudioRecordModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recorderControls, setRecorderControls] = useState<{ pauseRecording: () => void; cancelRecording: () => void; sendRecording: () => void } | null>(null)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsUploading(true)
    try {
      await onRecordingComplete(audioBlob)
      onClose()
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    if (recorderControls) {
      recorderControls.cancelRecording()
    }
    onClose()
  }

  const handlePause = () => {
    if (recorderControls) {
      recorderControls.pauseRecording()
    }
  }

  const handleSend = () => {
    if (recorderControls) {
      recorderControls.sendRecording()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          handleCancel()
        }
      }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4"
        style={{ backgroundColor: '#F5F1EB' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Recorder with timer and heart */}
        <div className="flex flex-col items-center mb-6">
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onCancel={handleCancel}
            onPause={(paused) => setIsPaused(paused)}
            onSend={handleSend}
            disabled={disabled || isUploading}
            autoStart={true}
            onControlsReady={setRecorderControls}
          />
          
          {isUploading && (
            <div className="mt-4 text-center" style={{ color: '#8B3A3A' }}>
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
        </div>

        {/* Action buttons */}
        {!isUploading && (
          <div className="flex items-center justify-center gap-4">
            {/* Cancel button (X) - отмена записи */}
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="p-3 rounded-full transition-all min-w-[56px] min-h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#E8E2D5',
                color: '#8B3A3A',
                border: '2px solid #C8BEB0',
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = '#D4C8B5'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E8E2D5'
              }}
              title="Отменить"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Pause button - показывает две черточки (пауза) когда идет запись, треугольник (play) когда на паузе */}
            <button
              onClick={handlePause}
              disabled={disabled || isUploading}
              className="p-3 rounded-full transition-all min-w-[56px] min-h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#E8E2D5',
                color: '#8B3A3A',
                border: '2px solid #8B3A3A',
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isUploading) {
                  e.currentTarget.style.backgroundColor = '#D4C8B5'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E8E2D5'
              }}
              title={isPaused ? 'Продолжить' : 'Пауза'}
            >
              {isPaused ? (
                // Play icon (треугольник) когда на паузе
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              ) : (
                // Pause icon (две черточки) когда идет запись
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
                </svg>
              )}
            </button>

            {/* Send button (like in messengers) - кнопка отправки как в мессенджерах */}
            <button
              onClick={handleSend}
              disabled={disabled || isUploading}
              className="p-3 rounded-full transition-all min-w-[56px] min-h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isUploading) {
                  e.currentTarget.style.backgroundColor = '#6B1F1F'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8B3A3A'
              }}
              title="Отправить"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" 
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

