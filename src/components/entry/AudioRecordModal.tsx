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

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsUploading(true)
    try {
      await onRecordingComplete(audioBlob)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          onClose()
        }
      }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 mx-4"
        style={{ backgroundColor: '#2B2B2B' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold pr-2" style={{ color: '#FFFFFF' }}>
            Записать голосовое сообщение
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-full transition-all disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: 'transparent',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
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

        {/* Recorder */}
        <div className="flex flex-col items-center">
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={disabled || isUploading}
          />
          
          {isUploading && (
            <div className="mt-4 text-center" style={{ color: '#FFFFFF' }}>
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
      </div>
    </div>
  )
}

