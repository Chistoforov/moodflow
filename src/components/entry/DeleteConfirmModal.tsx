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
        <h3 className="text-lg font-semibold mb-2">
          Удалить сообщение?
        </h3>
        {messageText && (
          <p 
            className="text-sm mb-4 p-3 rounded-lg"
            style={{
              backgroundColor: '#E8E2D5',
              color: '#8B3A3A',
            }}
          >
            {messageText.length > 100 
              ? `${messageText.substring(0, 100)}...` 
              : messageText}
          </p>
        )}
        <p className="text-sm mb-6" style={{ color: '#A67C6C' }}>
          Это действие нельзя отменить.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: '#E8E2D5',
              color: '#8B3A3A',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D4C8B5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E8E2D5'
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: '#D0021B',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B0021A'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#D0021B'
            }}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}


