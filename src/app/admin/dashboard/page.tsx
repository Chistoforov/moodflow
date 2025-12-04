export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-4xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="rounded-3xl shadow-sm p-8" 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Всего пользователей
          </h3>
          <p className="text-4xl font-bold" style={{ color: '#7c5cff' }}>0</p>
        </div>
        <div 
          className="rounded-3xl shadow-sm p-8" 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Активных подписок
          </h3>
          <p className="text-4xl font-bold" style={{ color: '#7c5cff' }}>0</p>
        </div>
        <div 
          className="rounded-3xl shadow-sm p-8" 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Записей за неделю
          </h3>
          <p className="text-4xl font-bold" style={{ color: '#7c5cff' }}>0</p>
        </div>
      </div>
    </div>
  )
}

