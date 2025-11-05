'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MOOD_LEVELS, FACTORS } from '@/lib/utils/constants'
import ChatMessage from '@/components/entry/ChatMessage'
import ChatInput from '@/components/entry/ChatInput'
import AudioRecordModal from '@/components/entry/AudioRecordModal'

interface Message {
  id: string
  text: string | null
  audioUrl?: string | null
  transcript?: string | null
  timestamp: string
  type: 'text' | 'audio'
}

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
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

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
        setSelectedFactors(entry.factors || [])
        
        // Parse messages from text_entry (JSON array)
        let loadedMessages: Message[] = []
        if (entry.text_entry) {
          try {
            const parsed = JSON.parse(entry.text_entry)
            if (Array.isArray(parsed)) {
              loadedMessages = parsed
            } else if (typeof parsed === 'string') {
              // Legacy format: single text string
              // Convert to message format
              loadedMessages = [{
                id: `legacy-${entry.id}`,
                text: parsed,
                timestamp: entry.created_at || new Date().toISOString(),
                type: 'text'
              }]
            }
          } catch {
            // If not JSON, treat as legacy single text entry
            loadedMessages = [{
              id: `legacy-${entry.id}`,
              text: entry.text_entry,
              timestamp: entry.created_at || new Date().toISOString(),
              type: 'text'
            }]
          }
        }
        
        // Add audio message if audio_url exists and not already in messages
        if (entry.audio_url) {
          const hasAudioInMessages = loadedMessages.some(msg => msg.audioUrl === entry.audio_url)
          if (!hasAudioInMessages) {
            const audioMessage: Message = {
              id: `audio-${entry.id}`,
              text: entry.transcript || null,
              audioUrl: entry.audio_url,
              timestamp: entry.created_at || new Date().toISOString(),
              type: 'audio'
            }
            loadedMessages.push(audioMessage)
          } else {
            // Update existing audio message with transcript if available
            loadedMessages = loadedMessages.map(msg => 
              msg.audioUrl === entry.audio_url && entry.transcript
                ? { ...msg, text: entry.transcript }
                : msg
            )
          }
        }
        
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error)
    } finally {
      setLoading(false)
    }
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const saveMessages = async (messagesToSave: Message[]) => {
    setSaving(true)
    try {
      // Convert messages to JSON string for storage
      const textEntryJson = JSON.stringify(messagesToSave)

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry_date: date,
          mood_score: moodScore,
          text_entry: textEntryJson,
          factors: selectedFactors,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save entry')
      }
    } catch (error) {
      console.error('Failed to save entry:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при сохранении записи'
      alert(`Ошибка при сохранении записи: ${errorMessage}`)
      throw error // Re-throw to allow caller to handle
    } finally {
      setSaving(false)
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    // Optimistically add message to UI
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)

    // Save to backend
    try {
      await saveMessages(updatedMessages)
    } catch (error) {
      // Revert optimistic update on error
      setMessages(messages)
    }
  }

  const handleAudioRecording = async (audioBlob: Blob) => {
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
        
        // Add audio message to chat
        const audioMessage: Message = {
          id: `audio-${Date.now()}-${Math.random()}`,
          audioUrl: data.audioUrl,
          text: null,
          timestamp: new Date().toISOString(),
          type: 'audio'
        }
        
        // Optimistically add message to UI
        const updatedMessages = [...messages, audioMessage]
        setMessages(updatedMessages)
        
        // Save to backend
        try {
          await saveMessages(updatedMessages)
        } catch (error) {
          // Revert optimistic update on error
          setMessages(messages)
          throw error
        }
        
        // Close modal
        setIsAudioModalOpen(false)
        
        // Poll for transcription status
        pollAudioTranscription(data.audioUrl)
      } else {
        throw new Error('Failed to upload audio')
      }
    } catch (error) {
      console.error('Failed to upload audio:', error)
      alert('Ошибка при загрузке аудио')
    }
  }

  const pollAudioTranscription = async (audioUrl: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/entries')
        const data = await response.json()
        const entry = data.entries?.find((e: any) => e.entry_date === date)
        
        if (entry && entry.audio_url === audioUrl) {
          if (entry.processing_status === 'completed' && entry.transcript) {
            // Update the audio message with transcript
            setMessages(prev => {
              const updated = prev.map(msg => 
                msg.audioUrl === audioUrl 
                  ? { ...msg, text: entry.transcript }
                  : msg
              )
              // Save updated messages
              saveMessages(updated).catch(console.error)
              return updated
            })
            clearInterval(pollInterval)
          } else if (entry.processing_status === 'failed') {
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Failed to poll transcription:', error)
      }
    }, 3000)

    // Clear after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000)
  }

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    )
  }

  const handleSaveFactors = async () => {
    await saveMessages(messages)
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-0" style={{ backgroundColor: '#E8E2D5' }}>
        <div className="text-center py-12" style={{ color: '#8B3A3A' }}>Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1E1E1E' }}>
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#1E1E1E' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/calendar')}
              className="p-2 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-semibold px-2 text-center flex-1" style={{ color: '#FFFFFF' }}>
              Запись за {date}
            </h1>
            <div style={{ width: '44px' }} /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Mood and Factors Section */}
      <div className="px-3 sm:px-4 py-4" style={{ backgroundColor: '#E8E2D5' }}>
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {/* Mood Selection */}
          <div className="rounded-2xl shadow-sm p-4 sm:p-6" style={{ backgroundColor: '#F5F1EB' }}>
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-center" style={{ color: '#8B3A3A' }}>
              Настроение
            </h2>
            <div className="flex justify-center flex-wrap gap-2 sm:gap-3 max-w-2xl mx-auto">
              {MOOD_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => {
                    setMoodScore(level.value)
                    handleSaveFactors()
                  }}
                  className="flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-xl transition-all min-w-[56px] sm:min-w-[70px] md:min-w-[80px]"
                  style={{
                    backgroundColor: moodScore === level.value ? '#E8E2D5' : 'transparent',
                    border: moodScore === level.value ? '2px solid #8B3A3A' : '2px solid transparent',
                  }}
                >
                  <div className="mb-1 sm:mb-2 flex justify-center">
                    <MoodSymbol score={level.value} selected={moodScore === level.value} size={36} />
                  </div>
                  <div className="text-xs font-medium text-center leading-tight" style={{ color: '#8B3A3A' }}>
                    {level.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Factors */}
          <div className="rounded-2xl shadow-sm p-4 sm:p-6" style={{ backgroundColor: '#F5F1EB' }}>
            <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: '#8B3A3A' }}>
              Факторы
            </h2>
            <div className="flex flex-wrap gap-2">
              {FACTORS.map(factor => (
                <button
                  key={factor.value}
                  onClick={() => {
                    toggleFactor(factor.value)
                    setTimeout(() => handleSaveFactors(), 100)
                  }}
                  className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[36px]"
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
        </div>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4"
        style={{ backgroundColor: '#1E1E1E' }}
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Начните писать, чтобы оставить отзыв о своем настроении
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSend={handleSendMessage}
        onAudioRecord={() => setIsAudioModalOpen(true)}
        disabled={saving}
        placeholder="Напишите о своих мыслях и чувствах..."
      />

      {/* Audio Recording Modal */}
      <AudioRecordModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onRecordingComplete={handleAudioRecording}
        disabled={saving}
      />
    </div>
  )
}

