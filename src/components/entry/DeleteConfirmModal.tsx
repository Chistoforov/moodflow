'use client'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  messageText?: string
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  messageText
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

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
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
          Удалить сообщение?
        </h3>
        {messageText && (
          <p 
            className="text-sm mb-4 p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {messageText.length > 100 
              ? `${messageText.substring(0, 100)}...` 
              : messageText}
          </p>
        )}
        <p className="text-sm mb-6" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Это действие нельзя отменить.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: '#ef4444',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444'
            }}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}


