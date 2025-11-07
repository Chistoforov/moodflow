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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
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

    const updatePosition = () => {
      const viewport = window.visualViewport
      if (!viewport || !containerRef.current) return

      const viewportHeight = viewport.height
      const viewportOffsetTop = viewport.offsetTop || 0
      const viewportOffsetLeft = viewport.offsetLeft || 0
      
      // Detect keyboard by checking if viewport height is significantly smaller
      const windowHeight = window.innerHeight
      const keyboardHeight = windowHeight - viewportHeight
      
      if (keyboardHeight > 50) {
        setKeyboardHeight(keyboardHeight)
        setIsKeyboardOpen(true)
        
        // Вычисляем правильную позицию bottom относительно layout viewport
        // Visual viewport находится на offsetTop пикселей ниже верха layout viewport
        // И имеет высоту viewport.height
        // Чтобы элемент был внизу visual viewport:
        // bottom = расстояние от низа layout viewport до низа visual viewport
        // bottom = window.innerHeight - (offsetTop + viewport.height)
        // Упрощаем: bottom = keyboardHeight - offsetTop
        const bottomPosition = keyboardHeight - viewportOffsetTop
        
        containerRef.current.style.position = 'fixed'
        containerRef.current.style.bottom = `${bottomPosition}px`
        containerRef.current.style.left = `${viewportOffsetLeft}px`
        containerRef.current.style.right = `${-viewportOffsetLeft}px`
        containerRef.current.style.width = 'auto'
      } else {
        setKeyboardHeight(0)
        setIsKeyboardOpen(false)
        
        // Возвращаем обычное позиционирование когда клавиатура закрыта
        if (containerRef.current) {
          containerRef.current.style.position = 'fixed'
          containerRef.current.style.bottom = '80px'
          containerRef.current.style.left = '0'
          containerRef.current.style.right = '0'
          containerRef.current.style.width = '100%'
        }
      }
    }

    const viewport = window.visualViewport
    if (viewport) {
      viewport.addEventListener('resize', updatePosition)
      viewport.addEventListener('scroll', updatePosition)
      
      // Также слушаем скролл window для обновления позиции
      window.addEventListener('scroll', updatePosition)
      
      updatePosition()
      
      return () => {
        if (viewport) {
          viewport.removeEventListener('resize', updatePosition)
          viewport.removeEventListener('scroll', updatePosition)
        }
        window.removeEventListener('scroll', updatePosition)
      }
    } else {
      // Fallback для старых браузеров
      let initialHeight = window.innerHeight
      
      const handleResize = () => {
        const currentHeight = window.innerHeight
        const heightDifference = initialHeight - currentHeight
        
        if (heightDifference > 100) {
          setKeyboardHeight(heightDifference)
          setIsKeyboardOpen(true)
        } else {
          setKeyboardHeight(0)
          setIsKeyboardOpen(false)
        }
      }

      window.addEventListener('resize', handleResize)
      handleResize()
      
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
      className="w-full px-3 sm:px-4 py-3"
      style={{
        backgroundColor: '#E8E2D5',
        borderTop: '1px solid #D4C8B5',
        // position, bottom, left, right, transform устанавливаются через JS в useEffect
        position: 'fixed',
        bottom: '80px',
        left: 0,
        right: 0,
        zIndex: 60, // Выше BottomNav (z-50)
        // Обеспечиваем аппаратное ускорение для плавной фиксации
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        perspective: 1000,
        WebkitPerspective: 1000,
        // Улучшаем производительность
        willChange: 'bottom, transform',
        // Убираем transition для более быстрого обновления позиции
        transition: 'none',
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
            color: '#8B3A3A',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 58, 58, 0.1)'
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
            touchAction: 'auto', // Allow interaction with textarea
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
            rows={2}
            className="w-full resize-none focus:outline-none bg-transparent text-sm sm:text-base chat-input-textarea"
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              color: '#8B3A3A',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              // Позволяем взаимодействие с textarea
              touchAction: 'manipulation',
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
            color: text.trim() ? '#FFFFFF' : '#8B3A3A',
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

