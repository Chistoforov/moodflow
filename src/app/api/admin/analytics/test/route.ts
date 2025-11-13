import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/route-handler'

/**
 * GET /api/admin/analytics/test
 * 
 * Test endpoint to check Perplexity API configuration
 */
export async function GET(request: NextRequest) {
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
    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('role, active')
      .eq('user_id', userSsoData.sso_uid)
      .eq('active', true)
      .maybeSingle()

    type PsychologistRole = { role: string; active: boolean }
    const psychologistData = psychologist as PsychologistRole | null

    if (!psychologistData || psychologistData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Check API key
    const apiKey = process.env.PERPLEXITY_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        status: 'error',
        message: 'PERPLEXITY_API_KEY is not configured',
        hasKey: false
      }, { status: 500 })
    }

    // Try a simple API call
    console.log('Testing Perplexity API connection...')
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Say "Test successful" if you can read this.'
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    })

    const responseText = await response.text()
    console.log('Perplexity API response status:', response.status)
    console.log('Perplexity API response:', responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { raw: responseText }
      }

      return NextResponse.json({ 
        status: 'error',
        message: 'Perplexity API call failed',
        hasKey: true,
        keyLength: apiKey.length,
        apiStatus: response.status,
        apiResponse: errorData
      }, { status: 500 })
    }

    const data = JSON.parse(responseText)
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Perplexity API is working correctly',
      hasKey: true,
      keyLength: apiKey.length,
      testResponse: data.choices?.[0]?.message?.content || 'No content'
    })

  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      status: 'error',
      message: 'Test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

