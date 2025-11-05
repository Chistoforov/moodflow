'use client'

interface ChatMessage {
  id: string
  text: string | null
  audioUrl?: string | null
  timestamp: string
  type: 'text' | 'audio'
}

interface ChatMessageProps {
  message: ChatMessage
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <div 
      className="flex justify-start mb-4"
      style={{
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <div
        className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm relative"
        style={{
          backgroundColor: '#F5F1EB',
          color: '#8B3A3A',
        }}
      >
        {/* Message tail */}
        <div
          className="absolute left-0 bottom-0 w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid #F5F1EB',
            borderBottom: '8px solid #F5F1EB',
            borderTop: '8px solid transparent',
            transform: 'translateX(-8px)',
          }}
        />
        
        {/* Message content */}
        <div className="relative">
          {message.type === 'audio' && message.audioUrl ? (
            <div className="mb-2">
              <audio 
                controls 
                src={message.audioUrl}
                className="w-full"
                style={{
                  filter: 'brightness(0.9)',
                }}
              />
            </div>
          ) : null}
          
          {message.text && (
            <p className="text-sm leading-relaxed mb-1 whitespace-pre-wrap break-words">
              {message.text}
            </p>
          )}
          
          {/* Timestamp */}
          <div className="flex justify-end items-center mt-1">
            <span 
              className="text-xs"
              style={{ color: '#A67C6C' }}
            >
              {formatTime(message.timestamp)}
            </span>
            {/* Checkmarks (like Telegram) */}
            <svg 
              width="14" 
              height="10" 
              viewBox="0 0 14 10" 
              className="ml-1"
              style={{ color: '#8B3A3A' }}
              fill="currentColor"
            >
              <path d="M0 5.5L3.5 9L14 0L12.5 0L3.5 7.5L1.5 5.5L0 5.5Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

