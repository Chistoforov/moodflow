'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MOOD_LEVELS, FACTORS } from '@/lib/utils/constants'
import ChatMessage from '@/components/entry/ChatMessage'
import ChatInput from '@/components/entry/ChatInput'
import AudioRecordModal from '@/components/entry/AudioRecordModal'
import DeleteConfirmModal from '@/components/entry/DeleteConfirmModal'
import ErrorModal from '@/components/entry/ErrorModal'

interface Message {
  id: string
  text: string
  timestamp: string
  type: 'text'
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null)
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Format date from YYYY-MM-DD to DD.MM.YYYY
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}.${year}`
  }

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
              // Filter out messages without text and ensure they match our interface
              loadedMessages = parsed
                .filter((msg: any) => msg.text && typeof msg.text === 'string')
                .map((msg: any) => ({
                  id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                  text: msg.text,
                  timestamp: msg.timestamp || new Date().toISOString(),
                  type: 'text' as const
                }))
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
        
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-scroll to show new messages
  useEffect(() => {
    if (messages.length > 0) {
      // Delay to ensure DOM is updated and content is rendered
      setTimeout(() => {
        // Scroll to bottom of the page to show new message
        const scrollHeight = document.documentElement.scrollHeight
        const windowHeight = window.innerHeight
        const scrollTarget = scrollHeight - windowHeight
        
        window.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        })
      }, 150)
    }
  }, [messages.length])

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
      setErrorModal({ isOpen: true, message: `Ошибка при сохранении записи: ${errorMessage}` })
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
      // Validate audio blob
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Аудиозапись пуста. Попробуйте записать еще раз.')
      }

      // Don't close modal here - let AudioRecordModal handle the animation
      // setIsAudioModalOpen(false) - REMOVED

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.transcript) {
          // Add transcript as a regular text message
          const textMessage: Message = {
            id: `msg-${Date.now()}-${Math.random()}`,
            text: data.transcript,
            timestamp: new Date().toISOString(),
            type: 'text'
          }
          
          // Optimistically add message to UI
          const updatedMessages = [...messages, textMessage]
          setMessages(updatedMessages)
          
          // Save to backend
          try {
            await saveMessages(updatedMessages)
          } catch (error) {
            // Revert optimistic update on error
            setMessages(messages)
            throw error
          }
        } else {
          throw new Error('Не удалось получить транскрипцию')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        const errorMessage = errorData.error || errorData.message || 'Не удалось распознать аудиозапись'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to transcribe audio:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при распознавании аудио'
      setErrorModal({ isOpen: true, message: errorMessage })
      // Close modal on error
      setIsAudioModalOpen(false)
    }
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

  // Universal function to save mood and factors with explicit values
  const saveMoodAndFactors = async (newMoodScore?: number | null, newFactors?: string[]) => {
    setSaving(true)
    try {
      const textEntryJson = messages.length > 0 ? JSON.stringify(messages) : null

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry_date: date,
          mood_score: newMoodScore !== undefined ? newMoodScore : moodScore,
          text_entry: textEntryJson,
          factors: newFactors !== undefined ? newFactors : selectedFactors,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save entry')
      }
    } catch (error) {
      console.error('Failed to save entry:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при сохранении записи'
      setErrorModal({ isOpen: true, message: `Ошибка при сохранении записи: ${errorMessage}` })
      throw error
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setMessageToDelete(message)
      setDeleteModalOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return

    // Store current messages for potential revert
    const previousMessages = messages

    // Remove message from array
    const updatedMessages = messages.filter(m => m.id !== messageToDelete.id)
    setMessages(updatedMessages)

    // Save to backend
    try {
      await saveMessages(updatedMessages)
      setDeleteModalOpen(false)
      setMessageToDelete(null)
    } catch (error) {
      // Revert on error
      setMessages(previousMessages)
      setErrorModal({ isOpen: true, message: 'Ошибка при удалении сообщения' })
      setDeleteModalOpen(false)
      setMessageToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-0" style={{ backgroundColor: '#1a1d2e' }}>
        <div className="text-center py-12" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ marginTop: '-64px', minHeight: '100vh' }}> {/* Offset the main's paddingTop */}
      {/* Scrollable content area - naturally scrolls */}
      <div 
        ref={chatContainerRef}
        style={{ 
          backgroundColor: '#1a1d2e',
          minHeight: '100vh',
          paddingTop: '64px', // Space for fixed header
          paddingBottom: '180px', // Space for ChatInput (~100px) + BottomNav (80px)
        }}
      >
        {/* Mood and Factors Section */}
        <div className="px-3 sm:px-4 py-4" style={{ backgroundColor: '#1a1d2e' }}>
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {/* Mood Selection */}
            <div 
              className="rounded-3xl shadow-sm p-4 sm:p-6" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Настроение на {formatDate(date)}
              </h2>
              <div className="flex justify-center flex-wrap gap-2 sm:gap-3 max-w-2xl mx-auto">
                {MOOD_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => {
                      setMoodScore(level.value)
                      saveMoodAndFactors(level.value)
                    }}
                    className="flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-xl transition-all min-w-[56px] sm:min-w-[70px] md:min-w-[80px]"
                    style={{
                      backgroundColor: moodScore === level.value ? 'rgba(124, 92, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: moodScore === level.value ? '2px solid #7c5cff' : '2px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="mb-1 sm:mb-2 flex justify-center">
                      <MoodSymbol score={level.value} selected={moodScore === level.value} size={36} />
                    </div>
                    <div className="text-xs font-medium text-center leading-tight" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {level.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Factors */}
            <div 
              className="rounded-3xl shadow-sm p-4 sm:p-6" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Факторы
              </h2>
              <div className="flex flex-wrap gap-2">
                {FACTORS.map(factor => (
                  <button
                    key={factor.value}
                    onClick={() => {
                      const newFactors = selectedFactors.includes(factor.value)
                        ? selectedFactors.filter(f => f !== factor.value)
                        : [...selectedFactors, factor.value]
                      toggleFactor(factor.value)
                      saveMoodAndFactors(undefined, newFactors)
                    }}
                    className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all min-h-[36px]"
                    style={{
                      backgroundColor: selectedFactors.includes(factor.value) ? '#7c5cff' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedFactors.includes(factor.value) ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                      border: `2px solid ${selectedFactors.includes(factor.value) ? '#7c5cff' : 'rgba(255, 255, 255, 0.1)'}`,
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
        <div className="px-3 sm:px-4 py-4" style={{ backgroundColor: '#1a1d2e' }}>
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onDelete={handleDeleteClick}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Chat Input - truly fixed, outside scrollable area */}
      <ChatInput
        onSend={handleSendMessage}
        onAudioRecord={() => setIsAudioModalOpen(true)}
        disabled={saving}
        placeholder="Оставьте голосовое сообщение или напишите отзыв о своем настроении. Дайте волю чувствам!"
        onFocus={() => {
          // Scroll page to bottom when keyboard appears
          setTimeout(() => {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth'
            })
          }, 100)
        }}
      />

      {/* Audio Recording Modal */}
      <AudioRecordModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onRecordingComplete={handleAudioRecording}
        onError={(message) => setErrorModal({ isOpen: true, message })}
        disabled={saving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setMessageToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        messageText={messageToDelete?.text}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </div>
  )
}

