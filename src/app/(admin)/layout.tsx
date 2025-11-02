import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user is admin
  const { data, error } = await supabase
    .from('psychologists')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  type Psychologist = Database['public']['Tables']['psychologists']['Row']
  const psychologist = data as Psychologist | null

  if (error || !psychologist || !psychologist.active) {
    redirect('/')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8E2D5' }}>
      <nav className="shadow-sm" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="handwritten text-3xl font-bold" style={{ color: '#8B3A3A' }}>
                  MoodFlow Admin
                </h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-3 py-2 text-base font-medium rounded-full transition-all"
                  style={{ color: '#8B3A3A' }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.backgroundColor = '#D4C8B5'
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Dashboard
                </a>
                <a
                  href="/users"
                  className="inline-flex items-center px-3 py-2 text-base font-medium rounded-full transition-all"
                  style={{ color: '#8B3A3A' }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.backgroundColor = '#D4C8B5'
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Пользователи
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

