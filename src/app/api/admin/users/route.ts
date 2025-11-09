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
    // First, get the user's sso_uid from users table
    const { data: user } = await supabase
      .from('users')
      .select('sso_uid')
      .eq('sso_uid', session.user.id)
      .maybeSingle()

    type UserWithSsoUid = { sso_uid: string }
    const userData = user as UserWithSsoUid | null

    if (!userData) {
      console.error('User not found in users table:', session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', userData.sso_uid)
      .maybeSingle()

    type Psychologist = Database['public']['Tables']['psychologists']['Row']
    const psychologistData = psychologist as Psychologist | null

    if (!psychologistData) {
      console.error('Psychologist not found for user_id:', userData.sso_uid)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (psychologistData.role !== 'admin') {
      console.error('User is not admin:', psychologistData.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!psychologistData.active) {
      console.error('Admin account is not active')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) throw usersError

    // Get all psychologists
    const { data: psychologists, error: psychologistsError } = await supabase
      .from('psychologists')
      .select('user_id, role, active')

    if (psychologistsError) throw psychologistsError

    // Create a map of psychologists by user_id (which matches users.sso_uid)
    const psychologistMap = new Map(
      psychologists?.map(p => [p.user_id, p]) || []
    )

    // Transform the data to include role from psychologist table
    const usersWithRoles = users?.map(user => {
      const psychologistData = psychologistMap.get(user.sso_uid);
      
      return {
        ...user,
        effective_role: psychologistData?.active && psychologistData.role 
          ? psychologistData.role 
          : user.subscription_tier
      }
    }) || []

    return NextResponse.json({ users: usersWithRoles })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

