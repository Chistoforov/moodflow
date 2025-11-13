import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: req,
  })

  try {
    // Проверка наличия переменных окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      })
      // Пропускаем middleware если нет переменных окружения
      return res
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
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

      // Проверка роли администратора
      const { data: psychologist, error } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error || !psychologist || !psychologist.active || psychologist.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Защита user routes
    if (req.nextUrl.pathname.startsWith('/calendar') || 
        req.nextUrl.pathname.startsWith('/entry') ||
        req.nextUrl.pathname.startsWith('/recommendations') ||
        req.nextUrl.pathname.startsWith('/materials') ||
        req.nextUrl.pathname.startsWith('/profile')) {
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
  } catch (error) {
    console.error('Middleware error:', error)
    // В случае любой ошибки пропускаем middleware и позволяем запросу пройти
    return res
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin',
    '/admin/:path*',
    '/calendar/:path*',
    '/entry/:path*',
    '/recommendations/:path*',
    '/profile/:path*',
    '/materials/:path*'
  ]
}

