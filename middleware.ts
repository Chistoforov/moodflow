import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    console.log('Middleware started for:', req.nextUrl.pathname)
    
    // Проверка переменных
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlStart: supabaseUrl?.substring(0, 20)
    })
    
    // Пока просто пропускаем все запросы
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
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

