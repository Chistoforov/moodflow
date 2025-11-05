'use client'

import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  onAudioRecord: () => void
  disabled?: boolean
  placeholder?: string
  onFocus?: () => void
}

export default function ChatInput({ 
  onSend, 
  onAudioRecord, 
  disabled = false,
  placeholder = "Напишите сообщение...",
  onFocus
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 120 // Max height for 4-5 lines
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [text])

  // Handle keyboard appearance on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleViewportChange = () => {
      if (typeof window.visualViewport !== 'undefined') {
        const viewport = window.visualViewport
        const windowHeight = window.innerHeight
        const viewportHeight = viewport.height
        const calculatedKeyboardHeight = windowHeight - viewportHeight
        
        // Only update if there's a significant difference (likely keyboard)
        if (calculatedKeyboardHeight > 50) {
          setKeyboardHeight(calculatedKeyboardHeight)
        } else {
          setKeyboardHeight(0)
        }
      }
    }

    // Use Visual Viewport API if available (modern browsers)
    if (typeof window.visualViewport !== 'undefined') {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      window.visualViewport.addEventListener('scroll', handleViewportChange)
      handleViewportChange() // Initial check
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
        window.visualViewport?.removeEventListener('scroll', handleViewportChange)
      }
    } else {
      // Fallback for older browsers
      let initialHeight = window.innerHeight
      
      const handleResize = () => {
        const currentHeight = window.innerHeight
        const heightDifference = initialHeight - currentHeight
        
        // Only set if significant difference (likely keyboard)
        if (heightDifference > 100) {
          setKeyboardHeight(heightDifference)
        } else {
          setKeyboardHeight(0)
          initialHeight = currentHeight // Reset baseline when keyboard closes
        }
      }

      window.addEventListener('resize', handleResize)
      handleResize() // Initial check
      
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const handleSend = () => {
    const trimmedText = text.trim()
    if (trimmedText && !disabled) {
      onSend(trimmedText)
      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full px-3 sm:px-4 py-3 transition-all duration-200"
      style={{
        backgroundColor: '#1E1E1E',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'translateY(0)',
        zIndex: 50,
      }}
    >
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        {/* Microphone button */}
        <button
          onClick={onAudioRecord}
          disabled={disabled}
          className="flex-shrink-0 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{
            backgroundColor: 'transparent',
            color: '#FFFFFF',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          title="Записать голосовое сообщение"
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15Z" 
              fill="currentColor"
            />
            <path 
              d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17Z" 
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Text input */}
        <div
          className="flex-1 rounded-2xl px-3 sm:px-4 py-2 flex items-end"
          style={{
            backgroundColor: '#E8E2D5',
            border: '1px solid #C8BEB0',
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // Scroll to bottom when input is focused (keyboard appears)
              setTimeout(() => {
                if (onFocus) onFocus()
              }, 300) // Small delay to let keyboard appear
            }}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none focus:outline-none bg-transparent text-sm sm:text-base chat-input-textarea"
            style={{
              minHeight: '24px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              color: '#8B3A3A',
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="flex-shrink-0 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{
            backgroundColor: text.trim() ? '#8B3A3A' : 'transparent',
            color: '#FFFFFF',
          }}
          onMouseEnter={(e) => {
            if (!disabled && text.trim()) {
              e.currentTarget.style.backgroundColor = '#7A2F2F'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = text.trim() ? '#8B3A3A' : 'transparent'
          }}
          title="Отправить"
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: 'rotate(0deg)' }}
          >
            <path 
              d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

