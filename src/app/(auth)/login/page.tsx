'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
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
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error

      setMessage('Проверьте почту для входа!')
    } catch (error: any) {
      setMessage(error.message || 'Ошибка входа')
    } finally {
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
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: '#E8E2D5',
                borderColor: '#C8BEB0',
                color: '#8B3A3A',
              }}
              placeholder="Email адрес"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border-none font-medium rounded-full disabled:opacity-50 transition-all"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#E8E2D5',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#6B1F1F'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8B3A3A'
              }}
            >
              {loading ? 'Отправка...' : 'Войти'}
            </button>
          </div>

          {message && (
            <div className="text-center" style={{ color: '#8B3A3A' }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

