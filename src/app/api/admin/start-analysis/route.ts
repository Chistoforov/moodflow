import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * NEW CLEAN ENDPOINT - Admin Analytics
 * Created: 2024-11-14
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 start-analysis endpoint called')
    
    // Parse request
    const body = await request.json()
    const { userId } = body
    
    console.log('📝 Requested userId:', userId)
    
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
    
    // Success - user found!
    return NextResponse.json({
      success: true,
      version: 'start-analysis-v1',
      deploymentCheck: 'NEW_CLEAN_ENDPOINT_WORKING',
      message: 'User found successfully! (Analysis not yet implemented)',
      userData: JSON.parse(JSON.stringify(userData))
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

