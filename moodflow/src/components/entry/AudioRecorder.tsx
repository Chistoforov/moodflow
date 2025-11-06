'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onCancel?: () => void
  onPause?: (isPaused: boolean) => void
  onSend?: () => void
  onControlsReady?: (controls: { pauseRecording: () => void; cancelRecording: () => void; sendRecording: () => void }) => void
  disabled?: boolean
  autoStart?: boolean
}

export default function AudioRecorder({ 
  onRecordingComplete, 
  onCancel,
  onPause,
  onSend,
  onControlsReady,
  disabled = false,
  autoStart = false
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Timer effect - starts when recording starts
  useEffect(() => {
    if (isRecording && !isPaused) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      // Stop timer when not recording or paused
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, isPaused])

  // Expose controls to parent
  useEffect(() => {
    if (onControlsReady && isRecording) {
      onControlsReady({
        pauseRecording,
        cancelRecording,
        sendRecording
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onControlsReady, isRecording])

  // Auto-start recording if autoStart is true
  useEffect(() => {
    if (autoStart && !isRecording && !disabled) {
      startRecording()
    }
  }, [autoStart])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
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
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        // Reset state
        setIsRecording(false)
        setRecordingTime(0)
        setIsPaused(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      // Reset timer and state before starting
      setRecordingTime(0)
      setIsPaused(false)
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      // Timer will start automatically via useEffect when isRecording becomes true
      
      // Expose controls immediately after starting recording
      if (onControlsReady) {
        onControlsReady({
          pauseRecording,
          cancelRecording,
          sendRecording
        })
      }

    } catch (error) {
      console.error('Failed to start recording:', error)
      setIsRecording(false)
      if (onCancel) {
        onCancel()
      }
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
        // Возобновляем запись (снимаем с паузы)
        if (mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume()
        }
        setIsPaused(false)
        // Timer will resume automatically via useEffect
        if (onPause) {
          onPause(false)
        }
      } else {
        // Ставим на паузу
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause()
        }
        setIsPaused(true)
        // Timer will pause automatically via useEffect
        if (onPause) {
          onPause(true)
        }
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    chunksRef.current = []
    setIsRecording(false)
    setRecordingTime(0)
    setIsPaused(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (onCancel) {
      onCancel()
    }
  }

  const sendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Останавливаем запись - это вызовет onstop, который вызовет onRecordingComplete
      if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.stop()
      }
      // onSend callback вызывается, но основная логика в onstop
      if (onSend) {
        onSend()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isRecording) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: isPaused ? 'none' : 'heartbeat 1.4s ease-in-out infinite',
              color: isPaused ? '#FDB022' : '#D0021B',
            }}
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="currentColor"
            />
          </svg>
          <span className="text-2xl sm:text-3xl font-mono font-bold" style={{ color: '#8B3A3A' }}>
            {formatTime(recordingTime)}
          </span>
        </div>
        <span className="text-sm" style={{ color: '#8B3A3A', opacity: 0.7 }}>
          {isPaused ? 'Пауза' : 'Идет запись...'}
        </span>
      </div>
    </div>
  )
}



