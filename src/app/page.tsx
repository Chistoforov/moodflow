import { Calendar, BarChart3, Stethoscope, Check } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StyledLink from '@/components/shared/StyledLink'

export default async function HomePage() {
  // Проверяем, авторизован ли пользователь
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Если пользователь авторизован, перенаправляем на календарь
  if (session) {
    redirect('/calendar')
  }
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1d2e' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <h1 
            className="handwritten text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6" 
            style={{ 
              background: 'linear-gradient(135deg, #9b7dff 0%, #c084fc 50%, #d893ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            MoodFlow
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 px-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Ваш персональный дневник настроения с поддержкой психологов
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <StyledLink
              href="/login"
              className="px-6 sm:px-8 py-3 rounded-full font-medium transition-all text-base sm:text-lg"
              style={{
                background: 'linear-gradient(135deg, #9b7dff 0%, #c084fc 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              hoverStyle={{
                background: 'linear-gradient(135deg, #8b6dff 0%, #b074ec 100%)',
                color: '#ffffff',
              }}
            >
              Войти
            </StyledLink>
            <StyledLink
              href="/calendar"
              className="px-6 sm:px-8 py-3 rounded-full font-medium transition-all border text-base sm:text-lg"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
              hoverStyle={{
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              Попробовать
            </StyledLink>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div 
            className="rounded-2xl shadow-sm p-6 sm:p-8" 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="mb-4">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#9b7dff' }} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Календарь настроения
            </h3>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Отслеживайте свое настроение каждый день и находите паттерны
            </p>
          </div>

          <div 
            className="rounded-2xl shadow-sm p-6 sm:p-8" 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="mb-4">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#c084fc' }} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Анализ состояния
            </h3>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Получайте еженедельные отчеты с анализом вашего состояния
            </p>
          </div>

          <div 
            className="rounded-2xl shadow-sm p-6 sm:p-8" 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="mb-4">
              <Stethoscope className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#d893ff' }} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Психологи
            </h3>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Профессиональные рекомендации и поддержка в любое время
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center px-4">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8" 
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            Выберите подходящий тариф
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div 
              className="rounded-2xl shadow-sm p-6 sm:p-8 border" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Бесплатно
              </h3>
              <div className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#9b7dff' }}>0 ₽</div>
              <ul className="text-left space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#9b7dff' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Календарь настроения
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#9b7dff' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Заметки и аудио
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#9b7dff' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Анализ состояния
                  </span>
                </li>
              </ul>
              <StyledLink
                href="/login"
                className="block w-full px-6 py-3 rounded-full font-medium text-center transition-all border text-sm sm:text-base"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                hoverStyle={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              >
                Начать
              </StyledLink>
            </div>

            <div 
              className="rounded-2xl shadow-xl p-6 sm:p-8 border-2 md:transform md:scale-105" 
              style={{ 
                backgroundColor: 'rgba(155, 125, 255, 0.1)',
                borderColor: '#9b7dff',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div 
                className="text-xs sm:text-sm font-bold py-2 px-4 rounded-full inline-block mb-4" 
                style={{
                  background: 'linear-gradient(135deg, #9b7dff 0%, #c084fc 100%)',
                  color: '#ffffff'
                }}
              >
                Популярный
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Подписка
              </h3>
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#c084fc' }}>
                990 ₽
                <span className="text-base sm:text-lg font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)' }}> /мес</span>
              </div>
              <ul className="text-left space-y-3 mb-6 sm:mb-8 mt-6">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#c084fc' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Всё из бесплатного
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#c084fc' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Рекомендации психолога
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#c084fc' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Недельные отчёты
                  </span>
                </li>
              </ul>
              <StyledLink
                href="/login"
                className="block w-full px-6 py-3 rounded-full font-medium text-center transition-all text-sm sm:text-base"
                style={{
                  background: 'linear-gradient(135deg, #9b7dff 0%, #c084fc 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                hoverStyle={{
                  background: 'linear-gradient(135deg, #8b6dff 0%, #b074ec 100%)',
                  color: '#ffffff',
                }}
              >
                Выбрать
              </StyledLink>
            </div>

            <div 
              className="rounded-2xl shadow-sm p-6 sm:p-8 border" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Личный психолог
              </h3>
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#d893ff' }}>
                4990 ₽
                <span className="text-base sm:text-lg font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)' }}> /мес</span>
              </div>
              <ul className="text-left space-y-3 mb-6 sm:mb-8 mt-6">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#d893ff' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Всё из подписки
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#d893ff' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Постоянный чат
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#d893ff' }} />
                  <span className="text-sm sm:text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Приоритетная поддержка
                  </span>
                </li>
              </ul>
              <StyledLink
                href="/login"
                className="block w-full px-6 py-3 rounded-full font-medium text-center transition-all border text-sm sm:text-base"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                hoverStyle={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              >
                Выбрать
              </StyledLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
