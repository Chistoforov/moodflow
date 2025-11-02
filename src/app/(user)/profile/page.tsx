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
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-4xl font-bold" style={{ color: '#8B3A3A' }}>Профиль</h1>
      </div>

      <div className="rounded-2xl shadow-sm divide-y" style={{ backgroundColor: '#F5F1EB', borderColor: '#C8BEB0' }}>
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: '#8B3A3A' }}>Подписка</h2>
          <div className="space-y-4">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
              <div
                key={key}
                className="border-2 rounded-xl p-6 transition-colors"
                style={{ 
                  backgroundColor: '#E8E2D5',
                  borderColor: '#C8BEB0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8B3A3A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#C8BEB0'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl" style={{ color: '#8B3A3A' }}>{tier.name}</h3>
                  <span className="text-xl font-bold" style={{ color: '#8B3A3A' }}>
                    {tier.price === 0 ? 'Бесплатно' : `${tier.price} ₽/мес`}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center" style={{ color: '#8B3A3A' }}>
                      <span className="mr-2">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                {key !== 'free' && (
                  <button 
                    className="w-full px-4 py-3 rounded-full font-medium transition-all"
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
                    Оформить
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          <button
            onClick={handleLogout}
            className="px-6 py-3 border-2 rounded-full font-medium transition-all"
            style={{
              color: '#8B3A3A',
              borderColor: '#8B3A3A',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D4C8B5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}

