#!/bin/bash

# Скрипт для подключения MoodFlow к новому проекту Vercel

echo "🚀 Настройка нового проекта Vercel для MoodFlow"
echo "================================================"
echo ""

# Проверяем, что Vercel CLI установлен
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен"
    echo "Установите: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI найден"
echo ""

# Проверяем авторизацию
echo "Проверяем авторизацию в Vercel..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Необходима авторизация в Vercel"
    echo "Запускаю: vercel login"
    vercel login
fi

echo "✅ Вы авторизованы в Vercel"
echo ""

# Удаляем старую конфигурацию (если еще не удалена)
if [ -d ".vercel" ]; then
    echo "Удаляю старую конфигурацию..."
    rm -rf .vercel
    echo "✅ Старая конфигурация удалена"
fi

echo ""
echo "📦 Создание нового проекта..."
echo "Vercel задаст несколько вопросов:"
echo "  1. Set up and deploy? → Y"
echo "  2. Which scope? → Выберите ваш аккаунт"
echo "  3. Link to existing project? → N (создаем новый)"
echo "  4. Project name? → moodflow (или другое)"
echo "  5. In which directory? → ./ (нажмите Enter)"
echo "  6. Override settings? → N"
echo ""
echo "Запускаю vercel..."
echo ""

# Запускаем vercel в интерактивном режиме
vercel

echo ""
echo "================================================"
echo "✅ Проект создан!"
echo ""
echo "📝 Следующие шаги:"
echo ""
echo "1. Добавьте переменные окружения:"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "   vercel env add NEXT_PUBLIC_APP_URL production"
echo "   vercel env add OPENAI_API_KEY production"
echo "   vercel env add PERPLEXITY_API_KEY production"
echo ""
echo "2. Задеплойте в production:"
echo "   vercel --prod"
echo ""
echo "3. Обновите callback URL в Supabase Dashboard"
echo ""
echo "Подробнее: см. VERCEL_NEW_PROJECT_SETUP.md"
echo "================================================"


