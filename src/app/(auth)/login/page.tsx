'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Проверяем, авторизован ли пользователь при загрузке страницы
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Если пользователь уже авторизован, перенаправляем на календарь
        router.push('/calendar')
      } else {
        setCheckingSession(false)
      }
    }
    checkSession()

    // Проверяем параметры URL для ошибок
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'auth_callback_error': 'Ошибка при входе. Попробуйте еще раз.',
        'unexpected_error': 'Произошла непредвиденная ошибка.',
        'no_code': 'Неверная ссылка для входа.',
        'auth_failed': 'Аутентификация не удалась.',
        'no_user': 'Пользователь не найден.',
        'callback_failed': 'Ошибка обработки входа.'
      }
      setError(errorMessages[errorParam] || 'Произошла ошибка.')
    }
  }, [router, supabase])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Ошибка входа через Google')
      setLoading(false)
    }
  }

  // Показываем загрузку пока проверяем сессию
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E2D5' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8B3A3A' }}></div>
          <p className="mt-4" style={{ color: '#8B3A3A' }}>Проверка сессии...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E8E2D5' }}>
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl" style={{ backgroundColor: '#F5F1EB' }}>
        <div>
          <h2 className="handwritten text-5xl font-bold text-center mb-4" style={{ color: '#8B3A3A' }}>
            MoodFlow
          </h2>
          <p className="text-center text-lg" style={{ color: '#8B3A3A' }}>
            Войдите в свой аккаунт
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-3 py-3 px-4 border-2 font-medium rounded-full disabled:opacity-50 transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'white',
              borderColor: '#C8BEB0',
              color: '#8B3A3A',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{loading ? 'Вход...' : 'Войти через Google'}</span>
          </button>

          {error && (
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F8D7DA', color: '#721C24' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

