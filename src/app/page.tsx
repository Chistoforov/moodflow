import Link from 'next/link'
import { Calendar, BarChart3, Stethoscope, Check } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            MoodFlow
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ваш персональный дневник настроения с поддержкой психологов
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Войти
            </Link>
            <Link
              href="/calendar"
              className="px-8 py-3 text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
            >
              Попробовать
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-5">
            <div className="mb-3">
              <Calendar className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Календарь настроения</h3>
            <p className="text-sm text-gray-600">
              Отслеживайте свое настроение каждый день и находите паттерны
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-5">
            <div className="mb-3">
              <BarChart3 className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Анализ состояния</h3>
            <p className="text-sm text-gray-600">
              Получайте еженедельные отчеты с анализом вашего состояния
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-5">
            <div className="mb-3">
              <Stethoscope className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Психологи</h3>
            <p className="text-sm text-gray-600">
              Профессиональные рекомендации и поддержка в любое время
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Выберите подходящий тариф
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-5 border-2 border-gray-200">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Бесплатно</h3>
              <div className="text-3xl font-bold mb-4 text-gray-900">0 ₽</div>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Календарь настроения
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Заметки и аудио
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Анализ состояния
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-2.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 font-medium text-center text-sm"
              >
                Начать
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-5 border-2 border-indigo-500 transform scale-105">
              <div className="bg-indigo-500 text-white text-xs font-bold py-1 px-3 rounded-full inline-block mb-3">
                Популярный
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Подписка</h3>
              <div className="text-3xl font-bold mb-4 text-gray-900">990 ₽<span className="text-base text-gray-600">/мес</span></div>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Всё из бесплатного
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Рекомендации психолога
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Недельные отчёты
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium text-center text-sm"
              >
                Выбрать
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-5 border-2 border-gray-200">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Личный психолог</h3>
              <div className="text-3xl font-bold mb-4 text-gray-900">4990 ₽<span className="text-base text-gray-600">/мес</span></div>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-700">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Всё из подписки
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Постоянный чат
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Приоритетная поддержка
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-2.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 font-medium text-center text-sm"
              >
                Выбрать
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
