'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
}

export default function AudioRecorder({ onRecordingComplete, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        
        // Reset state
        setIsRecording(false)
        setRecordingTime(0)
        setIsPaused(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Не удалось получить доступ к микрофону. Проверьте разрешения.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      mediaRecorderRef.current = null
    }
    chunksRef.current = []
    setIsRecording(false)
    setRecordingTime(0)
    setIsPaused(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#8B3A3A',
            color: '#E8E2D5',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = '#6B1F1F'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#8B3A3A'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15Z" fill="currentColor"/>
            <path d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17Z" fill="currentColor"/>
          </svg>
          Записать аудио
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-2xl font-mono font-bold" style={{ color: '#8B3A3A' }}>
              {formatTime(recordingTime)}
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={pauseRecording}
              className="p-3 rounded-full transition-all"
              style={{
                backgroundColor: '#E8E2D5',
                color: '#8B3A3A',
                border: '2px solid #8B3A3A',
              }}
              title={isPaused ? 'Продолжить' : 'Пауза'}
            >
              {isPaused ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4H10V20H6V4Z" fill="currentColor"/>
                  <path d="M14 4H18V20H14V4Z" fill="currentColor"/>
                </svg>
              )}
            </button>

            <button
              onClick={cancelRecording}
              className="p-3 rounded-full transition-all"
              style={{
                backgroundColor: '#E8E2D5',
                color: '#8B3A3A',
                border: '2px solid #C8BEB0',
              }}
              title="Отменить"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <button
              onClick={stopRecording}
              className="p-3 rounded-full transition-all"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#E8E2D5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6B1F1F'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8B3A3A'
              }}
              title="Завершить запись"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


