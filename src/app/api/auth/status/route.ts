import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'

// API для проверки статуса авторизации (для мобильных устройств)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json({ 
        authenticated: false, 
        error: error.message 
      }, { status: 200 })
    }

    if (session) {
      return NextResponse.json({ 
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
        }
      })
    }

    return NextResponse.json({ authenticated: false })
  } catch (error) {
    console.error('Error checking auth status:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

