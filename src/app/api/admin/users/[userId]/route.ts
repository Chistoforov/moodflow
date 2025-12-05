import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// PATCH /api/admin/users/[userId] - Update user role/subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
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

    const body = await request.json()
    const { subscription_tier, role } = body

    // If changing to admin role, add to psychologists table
    // userId is now sso_uid
    if (role === 'admin') {
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name, sso_uid')
        .eq('sso_uid', userId)
        .single() as any

      if (user) {
        await (supabase as any)
          .from('psychologists')
          .upsert({
            user_id: user.sso_uid,
            email: user.email,
            full_name: user.full_name || 'Admin',
            role: 'admin',
            active: true
          } as Database['public']['Tables']['psychologists']['Insert'])
      }
    }

    // If removing admin role, remove from psychologists table or set inactive
    if (role && role !== 'admin') {
      const { data: user } = await supabase
        .from('users')
        .select('sso_uid')
        .eq('sso_uid', userId)
        .single() as any

      if (user) {
        await (supabase as any)
          .from('psychologists')
          .update({ active: false })
          .eq('user_id', user.sso_uid)
      }
    }

    // Update subscription tier if provided
    if (subscription_tier) {
      const { data: updatedUser, error: updateError } = await (supabase as any)
        .from('users')
        .update({ subscription_tier })
        .eq('sso_uid', userId)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json({ user: updatedUser })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

