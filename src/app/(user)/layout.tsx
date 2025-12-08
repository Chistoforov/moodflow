import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'

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
      {/* Логотип сверху */}
      <header 
        className="shadow-sm fixed top-0 left-0 right-0 z-40" 
        style={{ backgroundColor: '#F5F1EB' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-14 sm:h-16 items-center">
            <h1 className="handwritten text-2xl sm:text-3xl font-bold" style={{ color: '#8B3A3A' }}>
              MoodFlow
            </h1>
          </div>
        </div>
      </header>
      
      {/* Контент - pages handle their own scrolling */}
      <main style={{ paddingTop: '64px' }}> {/* Space for fixed header */}
        {children}
      </main>
      
      {/* Нижнее меню */}
      <BottomNav />
    </div>
  )
}

