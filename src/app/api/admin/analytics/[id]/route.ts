import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// PATCH /api/admin/analytics/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
        const {
            general_impression,
            positive_trends,
            decline_reasons,
            recommendations,
            reflection_directions
        } = body

        // Update analytics
        // Cast to any to avoid "Argument of type '...' is not assignable to parameter of type 'never'"
        const { data: updatedAnalytics, error: updateError } = await (supabase
            .from('monthly_analytics') as any)
            .update({
                general_impression,
                positive_trends,
                decline_reasons,
                recommendations,
                reflection_directions,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating analytics:', updateError)
            return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
        }

        return NextResponse.json({ analytics: updatedAnalytics })
    } catch (error) {
        console.error('Error updating analytics:', error)
        return NextResponse.json(
            { error: 'Failed to update analytics' },
            { status: 500 }
        )
    }
}
