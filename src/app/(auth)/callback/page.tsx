'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Отключаем статическую генерацию для этой страницы
export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error_code = searchParams.get('error')
      const error_description = searchParams.get('error_description')
      
      // Обработка ошибок OAuth
      if (error_code) {
        console.error('OAuth error:', error_code, error_description)
        router.push(`/login?error=${error_code}`)
        return
      }
      
      if (code) {
        try {
          // Обмениваем code на сессию
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth error:', error)
            router.push('/login?error=auth_failed')
            return
          }

          // Получаем информацию о пользователе
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            // Пытаемся закрыть окно браузера для мобильных устройств
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            
            if (isMobile) {
              // Показываем сообщение и пытаемся закрыть окно
              const closeMessage = document.createElement('div')
              closeMessage.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; text-align: center; padding: 20px;">
                  <div style="font-size: 24px; margin-bottom: 20px; color: #8B3A3A;">✅ Вход выполнен!</div>
                  <div style="font-size: 16px; color: #8B3A3A; margin-bottom: 20px;">Закройте это окно и вернитесь в приложение</div>
                  <button onclick="window.close()" style="background: #8B3A3A; color: white; padding: 12px 24px; border-radius: 8px; border: none; font-size: 16px; cursor: pointer;">Закрыть окно</button>
                </div>
              `
              document.body.appendChild(closeMessage)
              
              // Попытка автоматически закрыть окно
              setTimeout(() => {
                window.close()
                // Если не получилось закрыть, перенаправляем
                setTimeout(() => {
                  router.push('/calendar')
                }, 1000)
              }, 1000)
            } else {
              // Для десктопа просто перенаправляем
              router.push('/calendar')
            }
          } else {
            router.push('/login?error=no_user')
          }
        } catch (error) {
          console.error('Callback error:', error)
          router.push('/login?error=callback_failed')
        }
      } else {
        // Проверяем, есть ли уже активная сессия
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/calendar')
        } else {
          router.push('/login')
        }
      }
    }

    handleCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Завершение входа...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

