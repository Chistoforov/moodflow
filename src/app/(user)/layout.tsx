import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserNav from '@/components/layout/UserNav'

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
      <UserNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

