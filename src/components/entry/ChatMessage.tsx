'use client'

interface ChatMessage {
  id: string
  text: string
  timestamp: string
  type: 'text'
}

interface ChatMessageProps {
  message: ChatMessage
  onDelete?: (messageId: string) => void
}

export default function ChatMessage({ message, onDelete }: ChatMessageProps) {
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
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Message content */}
        <div className="relative">
          <p className="text-sm leading-relaxed mb-1 whitespace-pre-wrap break-words">
            {message.text}
          </p>
          
          {/* Timestamp and Delete button */}
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center">
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 rounded-full transition-all opacity-60 hover:opacity-100 min-w-[24px] min-h-[24px] flex items-center justify-center"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                  }}
                  title="Удалить сообщение"
                >
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M10 11V17M14 11V17" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center">
              <span 
                className="text-xs"
                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
              >
                {formatTime(message.timestamp)}
              </span>
              {/* Checkmarks (like Telegram) */}
              <svg 
                width="14" 
                height="10" 
                viewBox="0 0 14 10" 
                className="ml-1"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                fill="currentColor"
              >
                <path d="M0 5.5L3.5 9L14 0L12.5 0L3.5 7.5L1.5 5.5L0 5.5Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

