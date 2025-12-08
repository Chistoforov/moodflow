'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SUBSCRIPTION_TIERS } from '@/lib/utils/constants'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="px-4 sm:px-0 pb-20">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Профиль</h1>
      </div>

      <div 
        className="rounded-3xl shadow-sm divide-y" 
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.03)', 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Подписка</h2>
          <div className="space-y-4">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
              <div
                key={key}
                className="rounded-xl p-4 sm:p-6 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7c5cff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                  <h3 className="font-bold text-lg sm:text-xl" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>{tier.name}</h3>
                  <span className="text-lg sm:text-xl font-bold" style={{ color: '#7c5cff' }}>
                    {tier.price === 0 ? 'Бесплатно' : `${tier.price} ₽/мес`}
                  </span>
                </div>
                <ul className="space-y-2 mb-4 sm:mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      <span className="mr-2 flex-shrink-0">✓</span> <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {key !== 'free' && (
                  <button 
                    className="w-full px-4 py-3 rounded-full font-medium transition-all text-sm sm:text-base min-h-[44px]"
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
                    Оформить
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-medium transition-all text-sm sm:text-base min-h-[44px]"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}

