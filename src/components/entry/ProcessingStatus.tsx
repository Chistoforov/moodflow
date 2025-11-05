'use client'

interface ProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | null
  className?: string
}

export default function ProcessingStatus({ status, className = '' }: ProcessingStatusProps) {
  if (!status || status === 'completed') {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
      case 'processing':
        return {
          icon: (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
              <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ),
          text: 'Аудио обрабатывается...',
          subtext: 'Вы можете закрыть приложение',
          bgColor: '#FDB022',
          textColor: '#FFFFFF',
        }
      case 'failed':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ),
          text: 'Ошибка обработки аудио',
          subtext: 'Попробуйте записать заново',
          bgColor: '#E53E3E',
          textColor: '#FFFFFF',
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  return (
    <div 
      className={`rounded-xl p-4 flex items-start gap-3 ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {config.icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-base">
          {config.text}
        </div>
        <div className="text-sm opacity-90 mt-1">
          {config.subtext}
        </div>
      </div>
    </div>
  )
}



