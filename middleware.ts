import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Защита admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Проверка роли
    const { data: psychologist } = await supabase
      .from('psychologists')
      .select('role, active')
      .eq('user_id', session.user.id)
      .single()

    if (!psychologist || !psychologist.active) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Защита user routes
  if (req.nextUrl.pathname.startsWith('/calendar') || 
      req.nextUrl.pathname.startsWith('/entry') ||
      req.nextUrl.pathname.startsWith('/recommendations')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Перенаправление авторизованных пользователей на календарь
  // если они пытаются попасть на главную страницу или страницу логина
  if (session && (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login')) {
    return NextResponse.redirect(new URL('/calendar', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/calendar/:path*', '/entry/:path*', '/recommendations/:path*']
}

