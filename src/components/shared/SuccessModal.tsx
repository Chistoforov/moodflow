'use client'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Успешно',
  message
}: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-6 max-w-sm w-full shadow-xl"
        style={{
          backgroundColor: 'rgba(26, 29, 46, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(124, 92, 255, 0.15)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: '#7c5cff' }}
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
              {title}
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl font-medium transition-all"
          style={{
            backgroundColor: '#7c5cff',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6b4de6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#7c5cff'
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}
