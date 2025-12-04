import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'
import AdminNav from './components/AdminNav'

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

  if (error || !psychologist || !psychologist.active || psychologist.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1d2e' }}>
      <AdminNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

