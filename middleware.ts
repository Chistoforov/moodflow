import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Защита admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Проверка роли
    const { data, error } = await supabase
      .from('psychologists')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    type Psychologist = Database['public']['Tables']['psychologists']['Row']
    const psychologist = data as Psychologist | null

    if (error || !psychologist || !psychologist.active) {
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
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/calendar/:path*',
    '/entry/:path*',
    '/recommendations/:path*',
    '/profile/:path*'
  ]
}

