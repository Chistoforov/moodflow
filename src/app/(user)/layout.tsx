import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8E2D5' }}>
      <nav className="shadow-sm" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="handwritten text-3xl font-bold" style={{ color: '#8B3A3A' }}>
                  MoodFlow
                </h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <a
                  href="/calendar"
                  className="inline-flex items-center px-3 py-2 text-base font-medium rounded-full transition-all"
                  style={{ color: '#8B3A3A' }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.backgroundColor = '#D4C8B5'
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Календарь
                </a>
                <a
                  href="/recommendations"
                  className="inline-flex items-center px-3 py-2 text-base font-medium rounded-full transition-all"
                  style={{ color: '#8B3A3A' }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.backgroundColor = '#D4C8B5'
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Рекомендации
                </a>
                <a
                  href="/profile"
                  className="inline-flex items-center px-3 py-2 text-base font-medium rounded-full transition-all"
                  style={{ color: '#8B3A3A' }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.backgroundColor = '#D4C8B5'
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Профиль
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

