'use client'

interface AnalysisConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}

export default function AnalysisConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName
}: AnalysisConfirmModalProps) {
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
        className="rounded-2xl p-8 max-w-md w-full shadow-xl"
        style={{
          backgroundColor: '#F5F1EB',
          color: '#8B3A3A',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Иконка */}
        <div 
          className="mb-6 w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{
            backgroundColor: '#E8E2D5',
          }}
        >
          <span className="text-4xl">📊</span>
        </div>

        {/* Заголовок */}
        <h3 className="text-2xl font-bold mb-3 text-center">
          Запустить анализ настроения?
        </h3>

        {/* Описание */}
        <div 
          className="mb-6 p-4 rounded-xl"
          style={{
            backgroundColor: '#E8E2D5',
          }}
        >
          <p className="text-sm font-medium mb-2">
            Пользователь:
          </p>
          <p className="text-base font-semibold">
            {userName}
          </p>
        </div>

        <p className="text-sm mb-6 text-center" style={{ color: '#A67C6C' }}>
          Система проанализирует записи пользователя за текущий месяц и создаст отчёт с рекомендациями.
        </p>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-xl font-semibold transition-all"
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
            className="flex-1 px-5 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: '#8B3A3A',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#A64B4B'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#8B3A3A'
            }}
          >
            Запустить
          </button>
        </div>
      </div>
    </div>
  )
}


