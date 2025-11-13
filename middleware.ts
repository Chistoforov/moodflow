import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Создаем базовый response
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    // Проверка наличия переменных окружения
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Если нет переменных окружения - пропускаем без ошибок
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables are not set')
      return response
    }

    // Создаем Supabase клиент для Edge Runtime
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Получаем сессию
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const pathname = req.nextUrl.pathname

    // Защита admin routes
    if (pathname.startsWith('/admin')) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Проверка роли администратора
      const { data: psychologist } = await supabase
        .from('psychologists')
        .select('role, active')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!psychologist?.active || psychologist?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Защита user routes
    const protectedRoutes = ['/calendar', '/entry', '/recommendations', '/materials', '/profile']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Перенаправление авторизованных пользователей
    if (session && (pathname === '/' || pathname === '/login')) {
      return NextResponse.redirect(new URL('/calendar', req.url))
    }

    return response
  } catch (error) {
    // Логируем ошибку, но не ломаем приложение
    console.error('Middleware error:', error)
    return response
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

