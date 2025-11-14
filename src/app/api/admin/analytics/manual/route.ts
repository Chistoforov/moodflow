import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import type { Database } from '@/types/database'
import { perplexityService } from '@/lib/integrations/perplexity'
import { endOfMonth, differenceInDays, lastDayOfMonth } from 'date-fns'

/**
 * POST /api/admin/analytics/manual
 * 
 * Manual trigger for monthly analytics for a specific user
 */
export async function POST(request: NextRequest) {
  const supabase = await createRouteHandlerClient()

  try {
    // Check if user is admin
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's sso_uid first (needed for psychologists table)
    const { data: currentUserData, error: currentUserError } = await supabase
      .from('users')
      .select('sso_uid')
      .eq('id', authUser.id)
      .maybeSingle()

    type UserSsoData = { sso_uid: string } | null
    const userSsoData = currentUserData as UserSsoData

    if (currentUserError || !userSsoData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify admin role (psychologists.user_id is TEXT referencing users.sso_uid)
    const { data: psychologist, error: psychologistError } = await supabase
      .from('psychologists')
      .select('role, active')
      .eq('user_id', userSsoData.sso_uid)
      .eq('active', true)
      .maybeSingle()

    type PsychologistRole = { role: string; active: boolean }
    const psychologistData = psychologist as PsychologistRole | null

    if (psychologistError || !psychologistData || psychologistData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get userId from request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get user data using service role to bypass RLS
    // Admin rights already verified above, so safe to use service role
    console.log('🔍 Attempting to fetch user:', userId)
    console.log('🔍 Current auth user:', authUser.id)
    
    // Check if service role key is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not configured!')
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables'
      }, { status: 500 })
    }
    
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY is configured (length:', serviceRoleKey.length, ')')
    
    // Create service role client for admin operations
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('📡 Using service role client to fetch user')
    
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    type User = Database['public']['Tables']['users']['Row']
    const user = userData as User | null

    console.log('📊 User query result:', { found: !!userData, hasError: !!userError })

    if (userError || !user) {
      console.error('❌ User not found:', { userId, userError })
      return NextResponse.json({ 
        error: 'User not found',
        debug: {
          userId,
          authUserId: authUser.id,
          serviceRoleKeyConfigured: !!serviceRoleKey,
          serviceRoleKeyLength: serviceRoleKey?.length || 0,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          errorMessage: userError?.message,
          errorCode: userError?.code,
          errorDetails: userError?.details,
          errorHint: userError?.hint
        }
      }, { status: 404 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12

    // Calculate date range for current month
    const monthStart = new Date(currentYear, currentMonth - 1, 1)
    const monthEnd = endOfMonth(monthStart)
    const lastDay = lastDayOfMonth(monthStart)
    
    const daysInMonth = differenceInDays(
      now > monthEnd ? monthEnd : now,
      monthStart
    ) + 1
    
    const weekNumber = Math.ceil(daysInMonth / 7)
    
    // Check if analysis already exists for this week (using admin client)
    const { data: existingAnalysis } = await supabaseAdmin
      .from('monthly_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .eq('week_number', weekNumber)
      .maybeSingle()

    if (existingAnalysis) {
      return NextResponse.json({ 
        message: 'Analysis already exists for this period',
        analysis: existingAnalysis
      }, { status: 200 })
    }

    // Get all entries for the month up to today (using admin client)
    const { data: entriesData, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', monthStart.toISOString().split('T')[0])
      .lte('entry_date', now > monthEnd ? monthEnd.toISOString().split('T')[0] : now.toISOString().split('T')[0])
      .eq('is_deleted', false)
      .order('entry_date', { ascending: true })

    type Entry = Database['public']['Tables']['daily_entries']['Row']
    const entries = entriesData as Entry[] | null

    if (entriesError || !entries || entries.length < 3) {
      return NextResponse.json({ 
        error: 'Not enough entries for analysis',
        details: 'Minimum 3 entries required',
        entriesCount: entries?.length || 0
      }, { status: 400 })
    }

    // Analyze with Perplexity
    console.log('📊 Preparing to analyze with Perplexity...')
    console.log('📝 Entries to analyze:', entries.length)
    console.log('📅 Week number:', weekNumber)
    console.log('📆 Days in month:', daysInMonth)
    
    const analysis = await perplexityService.analyzeMonthlyMood({
      entries: entries.map(e => ({
        date: e.entry_date,
        mood: e.mood_score || 3,
        text: e.text_entry || '',
        factors: e.factors || [],
      })),
      weekNumber,
      totalDays: daysInMonth,
    })
    
    console.log('✅ Perplexity analysis completed successfully')

    // Save monthly analytics
    const isLastDay = now.getDate() === lastDay.getDate()
    
    type AnalyticsInsert = Database['public']['Tables']['monthly_analytics']['Insert']
    const analyticsData: AnalyticsInsert = {
      user_id: user.id,
      year: currentYear,
      month: currentMonth,
      week_number: weekNumber,
      days_analyzed: daysInMonth,
      analysis_text: analysis.fullText,
      general_impression: analysis.generalImpression,
      positive_trends: analysis.positiveTrends,
      decline_reasons: analysis.declineReasons,
      recommendations: analysis.recommendations,
      reflection_directions: analysis.reflectionDirections,
      is_final: isLastDay,
      status: 'completed',
    }
    
    const { data: newAnalysis, error: insertError } = await supabaseAdmin
      .from('monthly_analytics')
      .insert(analyticsData as any)
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save analytics:', insertError)
      return NextResponse.json({ 
        error: 'Failed to save analysis',
        details: insertError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Analysis completed successfully',
      analysis: newAnalysis,
      metadata: {
        userId: user.id,
        userName: user.full_name,
        weekNumber,
        daysAnalyzed: daysInMonth,
        entriesAnalyzed: entries.length,
        isFinal: isLastDay,
        month: currentMonth,
        year: currentYear
      }
    })
  } catch (error: any) {
    console.error('❌ Manual analytics error:', error)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    // Log more details if available
    if (error.cause) {
      console.error('❌ Error cause:', error.cause)
    }
    
    // Try to serialize the error
    try {
      console.error('❌ Error details (JSON):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    } catch (serializeError) {
      console.error('❌ Could not serialize error')
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate analysis',
      message: error.message,
      name: error.name,
      details: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

