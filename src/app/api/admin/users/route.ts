import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Check authentication and admin role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    type Psychologist = Database['public']['Tables']['psychologists']['Row']
    const psychologistData = psychologist as Psychologist | null

    if (!psychologistData || psychologistData.role !== 'admin' || !psychologistData.active) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) throw usersError

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

