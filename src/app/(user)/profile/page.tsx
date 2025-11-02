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
        <h1 className="text-3xl font-bold text-gray-900">Профиль</h1>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Подписка</h2>
          <div className="space-y-4">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
              <div
                key={key}
                className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                  <span className="text-lg font-bold text-gray-900">
                    {tier.price === 0 ? 'Бесплатно' : `${tier.price} ₽/мес`}
                  </span>
                </div>
                <ul className="space-y-1 mb-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                {key !== 'free' && (
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Оформить
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}

