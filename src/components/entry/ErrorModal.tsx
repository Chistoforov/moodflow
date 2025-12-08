'use client'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export default function ErrorModal({
  isOpen,
  onClose,
  title = 'Ошибка',
  message
}: ErrorModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-sm w-full shadow-xl"
        style={{
          backgroundColor: '#F5F1EB',
          color: '#8B3A3A',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#FFE8E8',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: '#D0021B' }}
            >
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#8B3A3A' }}>
              {title}
            </h3>
            <p className="text-sm" style={{ color: '#A67C6C' }}>
              {message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl font-medium transition-all"
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
        >
          Понятно
        </button>
      </div>
    </div>
  )
}


