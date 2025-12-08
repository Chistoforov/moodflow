import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Отключаем кеширование для этого route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/calendar'

  if (code) {
    try {
      const supabase = await createRouteHandlerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
      }

      // Успешная аутентификация - редирект на календарь
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(new URL('/login?error=unexpected_error', requestUrl.origin))
    }
  }

  // Если нет кода, редирект на страницу логина
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
}

