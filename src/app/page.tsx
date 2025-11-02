import Link from 'next/link'

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

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Календарь настроения</h3>
            <p className="text-gray-600">
              Отслеживайте свое настроение каждый день и находите паттерны
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">ИИ-анализ</h3>
            <p className="text-gray-600">
              Получайте еженедельные отчеты с анализом вашего состояния
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">Психологи</h3>
            <p className="text-gray-600">
              Профессиональные рекомендации и поддержка в любое время
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Выберите подходящий тариф
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Бесплатно</h3>
              <div className="text-4xl font-bold mb-6">0 ₽</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Календарь настроения
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Заметки и аудио
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Авто-анализ от ИИ
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-3 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 font-medium text-center"
              >
                Начать
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-indigo-500 transform scale-105">
              <div className="bg-indigo-500 text-white text-sm font-bold py-1 px-4 rounded-full inline-block mb-4">
                Популярный
              </div>
              <h3 className="text-2xl font-bold mb-4">Подписка</h3>
              <div className="text-4xl font-bold mb-6">990 ₽<span className="text-lg text-gray-500">/мес</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Всё из бесплатного
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Рекомендации психолога
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Недельные отчёты
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium text-center"
              >
                Выбрать
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Личный психолог</h3>
              <div className="text-4xl font-bold mb-6">4990 ₽<span className="text-lg text-gray-500">/мес</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Всё из подписки
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Постоянный чат
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Приоритетная поддержка
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full px-6 py-3 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 font-medium text-center"
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
