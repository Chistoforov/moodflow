import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { perplexityService } from '@/lib/integrations/perplexity'
import { endOfMonth, differenceInDays, lastDayOfMonth } from 'date-fns'

/**
 * NEW CLEAN ENDPOINT - Admin Analytics
 * Created: 2024-11-14
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 start-analysis endpoint called')
    
    // Parse request
    const body = await request.json()
    const { userId, forceRecreate = false } = body
    
    console.log('📝 Requested userId:', userId, 'forceRecreate:', forceRecreate)
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required',
        version: 'start-analysis-v1'
      }, { status: 400 })
    }
    
    // Check env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔑 Has Supabase URL:', !!supabaseUrl)
    console.log('🔑 Has Service Role Key:', !!serviceRoleKey, 'length:', serviceRoleKey?.length)
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: 'Server configuration error',
        version: 'start-analysis-v1',
        debug: {
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceRoleKey: !!serviceRoleKey
        }
      }, { status: 500 })
    }
    
    // Create admin client
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    console.log('✅ Admin client created')
    
    // Fetch user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, sso_uid, subscription_tier')
      .eq('id', userId)
      .maybeSingle()
    
    console.log('📊 User fetch result:', { found: !!userData, error: !!userError })
    
    if (userError || !userData) {
      return NextResponse.json({
        error: 'User not found',
        version: 'start-analysis-v1',
        deploymentCheck: 'NEW_CLEAN_ENDPOINT_WORKING',
        debug: {
          userId,
          hasServiceRoleKey: true,
          serviceRoleKeyLength: serviceRoleKey.length,
          errorMessage: userError?.message,
          errorCode: userError?.code,
          errorDetails: userError?.details,
          errorHint: userError?.hint
        }
      }, { status: 404 })
    }
    
    // User found! Now proceed with analysis
    console.log('✅ User found, proceeding with analysis...')
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    const monthStart = new Date(currentYear, currentMonth - 1, 1)
    const monthEnd = endOfMonth(monthStart)
    const lastDay = lastDayOfMonth(monthStart)
    
    const daysInMonth = differenceInDays(
      now > monthEnd ? monthEnd : now,
      monthStart
    ) + 1
    
    const weekNumber = Math.ceil(daysInMonth / 7)
    
    // Check if analysis already exists (using sso_uid)
    const userDataCheck = userData as any
    const authUserIdCheck = userDataCheck.sso_uid
    
    const { data: existingAnalysis } = await supabase
      .from('monthly_analytics')
      .select('*')
      .eq('user_id', authUserIdCheck)
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .eq('week_number', weekNumber)
      .maybeSingle()
    
    if (existingAnalysis && !forceRecreate) {
      return NextResponse.json({
        message: 'Analysis already exists for this period',
        analysis: existingAnalysis
      }, { status: 200 })
    }
    
    // If forceRecreate is true and analysis exists, delete it first
    if (existingAnalysis && forceRecreate) {
      console.log('🗑️ Deleting existing analysis to recreate...')
      const { error: deleteError } = await supabase
        .from('monthly_analytics')
        .delete()
        .eq('id', existingAnalysis.id)
      
      if (deleteError) {
        console.error('Failed to delete existing analysis:', deleteError)
        return NextResponse.json({
          error: 'Failed to delete existing analysis',
          details: deleteError.message
        }, { status: 500 })
      }
      console.log('✅ Existing analysis deleted')
    }
    
    // Get entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('daily_entries')
      .select('entry_date, mood_score, text_entry, factors')
      .eq('user_id', userId)
      .gte('entry_date', monthStart.toISOString().split('T')[0])
      .lte('entry_date', (now > monthEnd ? monthEnd : now).toISOString().split('T')[0])
      .eq('is_deleted', false)
      .order('entry_date', { ascending: true })
    
    if (entriesError || !entriesData || entriesData.length < 3) {
      return NextResponse.json({
        error: 'Not enough entries for analysis',
        details: 'Minimum 3 entries required',
        entriesCount: entriesData?.length || 0
      }, { status: 400 })
    }
    
    console.log('📊 Analyzing', entriesData.length, 'entries with Perplexity...')
    
    // Analyze with Perplexity
    const analysis = await perplexityService.analyzeMonthlyMood({
      entries: entriesData.map((e: any) => ({
        date: e.entry_date,
        mood: e.mood_score || 3,
        text: e.text_entry || '',
        factors: e.factors || []
      })),
      weekNumber,
      totalDays: daysInMonth
    })
    
    console.log('✅ Analysis completed')
    
    // Save analytics
    const isLastDay = now.getDate() === lastDay.getDate()
    
    // Use sso_uid for monthly_analytics because it references auth.users(id)
    const userDataAny2 = userData as any
    const authUserId = userDataAny2.sso_uid
    
    if (!authUserId) {
      return NextResponse.json({
        error: 'User sso_uid not found',
        details: 'Cannot create analytics without auth user id'
      }, { status: 500 })
    }
    
    const analyticsData = {
      user_id: authUserId, // Use sso_uid, not public.users.id!
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
      status: 'completed' as const
    }
    
    const { data: newAnalysis, error: insertError } = await supabase
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
    
    const userDataAny = userData as any
    
    return NextResponse.json({
      message: 'Analysis completed successfully',
      analysis: newAnalysis,
      metadata: {
        userId,
        userName: userDataAny.full_name || userDataAny.email || 'Unknown',
        weekNumber,
        daysAnalyzed: daysInMonth,
        entriesAnalyzed: entriesData.length,
        isFinal: isLastDay,
        month: currentMonth,
        year: currentYear
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      version: 'start-analysis-v1',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

