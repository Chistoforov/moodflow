'use client'

import { useState, useEffect } from 'react'
import AudioRecorder from './AudioRecorder'

interface AudioRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onRecordingComplete: (audioBlob: Blob) => Promise<void>
  disabled?: boolean
}

export default function AudioRecordModal({ 
  isOpen, 
  onClose, 
  onRecordingComplete,
  disabled = false
}: AudioRecordModalProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [recorderControls, setRecorderControls] = useState<{ pauseRecording: () => void; cancelRecording: () => void; sendRecording: () => void } | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setShowSuccessMessage(false)
    }
  }, [isOpen])

  const handleRecordingComplete = async (audioBlob: Blob) => {
    // Show success message immediately
    setShowSuccessMessage(true)
    
    // Upload in background (no await, no loading state)
    onRecordingComplete(audioBlob).catch((error) => {
      console.error('Failed to upload audio:', error)
      // Error handling is done in parent component
    })
    
    // Wait 1.5 seconds, then start closing animation
    setTimeout(() => {
      setIsClosing(true)
      // Wait for animation to finish (300ms) before actually closing
      setTimeout(() => {
        onClose()
      }, 300)
    }, 1500)
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !showSuccessMessage) {
          handleCancel()
        }
      }}
    >
      <div
        className={`rounded-3xl shadow-2xl max-w-md w-full p-6 mx-4 transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ 
          backgroundColor: 'rgba(26, 29, 46, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success message */}
        {showSuccessMessage ? (
          <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
            <div 
              className="mb-4 rounded-full p-4 animate-scale-in"
              style={{ backgroundColor: '#7c5cff' }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p 
              className="text-2xl font-semibold animate-slide-up"
              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
            >
              Запись сохранена
            </p>
          </div>
        ) : (
          <>
            {/* Recorder with timer and heart */}
            <div className="flex flex-col items-center mb-6">
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                onCancel={handleCancel}
                onPause={(paused) => setIsPaused(paused)}
                onSend={handleSend}
                disabled={disabled}
                autoStart={true}
                onControlsReady={setRecorderControls}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4">
                {/* Cancel button (X) - отмена записи */}
                <button
                  onClick={handleCancel}
                  disabled={disabled}
                  className="p-3 rounded-full transition-all min-w-[56px] min-h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
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
                  disabled={disabled}
                  className="p-3 rounded-full transition-all min-w-[56px] min-h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#7c5cff',
                    border: '1px solid #7c5cff',
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor = 'rgba(124, 92, 255, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
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
                  disabled={disabled}
                  className="p-3 rounded-full transition-all min-w-[56px] min-h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#7c5cff',
                    color: '#FFFFFF',
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor = '#6b4de6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#7c5cff'
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
          </>
        )}
      </div>
    </div>
  )
}

