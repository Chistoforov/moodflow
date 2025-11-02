import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createRouteHandlerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to calendar after successful login
  return NextResponse.redirect(new URL('/calendar', requestUrl.origin))
}

