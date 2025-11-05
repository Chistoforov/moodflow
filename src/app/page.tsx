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
    <div className="min-h-screen" style={{ backgroundColor: '#E8E2D5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <h1 className="handwritten text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6" style={{ color: '#8B3A3A' }}>
            MoodFlow
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 px-4" style={{ color: '#8B3A3A' }}>
            Ваш персональный дневник настроения с поддержкой психологов
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <StyledLink
              href="/login"
              className="px-6 sm:px-8 py-3 rounded-full font-medium transition-all text-base sm:text-lg"
              style={{
                backgroundColor: '#8B3A3A',
                color: '#E8E2D5',
              }}
              hoverStyle={{
                backgroundColor: '#6B1F1F',
                color: '#E8E2D5',
              }}
            >
              Войти
            </StyledLink>
            <StyledLink
              href="/calendar"
              className="px-6 sm:px-8 py-3 rounded-full font-medium transition-all border-2 text-base sm:text-lg"
              style={{
                color: '#8B3A3A',
                backgroundColor: 'transparent',
                borderColor: '#8B3A3A',
              }}
              hoverStyle={{
                color: '#8B3A3A',
                backgroundColor: '#D4C8B5',
                borderColor: '#8B3A3A',
              }}
            >
              Попробовать
            </StyledLink>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="rounded-2xl shadow-sm p-6 sm:p-8" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="mb-4">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#8B3A3A' }} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: '#8B3A3A' }}>Календарь настроения</h3>
            <p className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>
              Отслеживайте свое настроение каждый день и находите паттерны
            </p>
          </div>

          <div className="rounded-2xl shadow-sm p-6 sm:p-8" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="mb-4">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#8B3A3A' }} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: '#8B3A3A' }}>Анализ состояния</h3>
            <p className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>
              Получайте еженедельные отчеты с анализом вашего состояния
            </p>
          </div>

          <div className="rounded-2xl shadow-sm p-6 sm:p-8" style={{ backgroundColor: '#F5F1EB' }}>
            <div className="mb-4">
              <Stethoscope className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#8B3A3A' }} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: '#8B3A3A' }}>Психологи</h3>
            <p className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>
              Профессиональные рекомендации и поддержка в любое время
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8" style={{ color: '#8B3A3A' }}>
            Выберите подходящий тариф
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl shadow-sm p-6 sm:p-8 border-2" style={{ 
              backgroundColor: '#F5F1EB',
              borderColor: '#C8BEB0'
            }}>
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#8B3A3A' }}>Бесплатно</h3>
              <div className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#8B3A3A' }}>0 ₽</div>
              <ul className="text-left space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Календарь настроения</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Заметки и аудио</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Анализ состояния</span>
                </li>
              </ul>
              <StyledLink
                href="/login"
                className="block w-full px-6 py-3 rounded-full font-medium text-center transition-all border-2 text-sm sm:text-base"
                style={{
                  color: '#8B3A3A',
                  backgroundColor: 'transparent',
                  borderColor: '#8B3A3A',
                }}
                hoverStyle={{
                  color: '#8B3A3A',
                  backgroundColor: '#D4C8B5',
                  borderColor: '#8B3A3A',
                }}
              >
                Начать
              </StyledLink>
            </div>

            <div className="rounded-2xl shadow-xl p-6 sm:p-8 border-2 md:transform md:scale-105" style={{ 
              backgroundColor: '#F5F1EB',
              borderColor: '#8B3A3A'
            }}>
              <div className="text-xs sm:text-sm font-bold py-2 px-4 rounded-full inline-block mb-4" style={{
                backgroundColor: '#8B3A3A',
                color: '#E8E2D5'
              }}>
                Популярный
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#8B3A3A' }}>Подписка</h3>
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#8B3A3A' }}>
                990 ₽
                <span className="text-base sm:text-lg font-normal"> /мес</span>
              </div>
              <ul className="text-left space-y-3 mb-6 sm:mb-8 mt-6">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Всё из бесплатного</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Рекомендации психолога</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Недельные отчёты</span>
                </li>
              </ul>
              <StyledLink
                href="/login"
                className="block w-full px-6 py-3 rounded-full font-medium text-center transition-all text-sm sm:text-base"
                style={{
                  backgroundColor: '#8B3A3A',
                  color: '#E8E2D5',
                }}
                hoverStyle={{
                  backgroundColor: '#6B1F1F',
                  color: '#E8E2D5',
                }}
              >
                Выбрать
              </StyledLink>
            </div>

            <div className="rounded-2xl shadow-sm p-6 sm:p-8 border-2" style={{ 
              backgroundColor: '#F5F1EB',
              borderColor: '#C8BEB0'
            }}>
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#8B3A3A' }}>Личный психолог</h3>
              <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#8B3A3A' }}>
                4990 ₽
                <span className="text-base sm:text-lg font-normal"> /мес</span>
              </div>
              <ul className="text-left space-y-3 mb-6 sm:mb-8 mt-6">
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Всё из подписки</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Постоянный чат</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#8B3A3A' }} />
                  <span className="text-sm sm:text-base" style={{ color: '#8B3A3A' }}>Приоритетная поддержка</span>
                </li>
              </ul>
              <StyledLink
                href="/login"
                className="block w-full px-6 py-3 rounded-full font-medium text-center transition-all border-2 text-sm sm:text-base"
                style={{
                  color: '#8B3A3A',
                  backgroundColor: 'transparent',
                  borderColor: '#8B3A3A',
                }}
                hoverStyle={{
                  color: '#8B3A3A',
                  backgroundColor: '#D4C8B5',
                  borderColor: '#8B3A3A',
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
