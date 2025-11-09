export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#8B3A3A', opacity: 0.7 }}>
            Всего пользователей
          </h3>
          <p className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>0</p>
        </div>
        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#8B3A3A', opacity: 0.7 }}>
            Активных подписок
          </h3>
          <p className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>0</p>
        </div>
        <div className="rounded-2xl shadow-sm p-8" style={{ backgroundColor: '#F5F1EB' }}>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#8B3A3A', opacity: 0.7 }}>
            Записей за неделю
          </h3>
          <p className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>0</p>
        </div>
      </div>
    </div>
  )
}

