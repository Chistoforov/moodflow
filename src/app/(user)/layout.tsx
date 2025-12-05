import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'

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
    <div className="min-h-screen" style={{ backgroundColor: '#1a1d2e' }}>
      {/* Логотип сверху */}
      <header 
        className="shadow-sm" 
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-14 sm:h-16 items-center">
            <Link href="/calendar" className="cursor-pointer">
              <h1 
                className="handwritten text-3xl sm:text-4xl font-bold" 
                style={{ 
                  background: 'linear-gradient(135deg, #9b7dff 0%, #c084fc 50%, #d893ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                MoodFlow
              </h1>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Контент */}
      <main>
        {children}
      </main>
      
      {/* Нижнее меню */}
      <BottomNav />
    </div>
  )
}

