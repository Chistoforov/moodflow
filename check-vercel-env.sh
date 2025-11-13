#!/bin/bash

# Скрипт для проверки переменных окружения на Vercel

echo "🔍 Проверка переменных окружения на Vercel..."
echo ""

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен"
    echo "Установите: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI установлен"
echo ""

# Получаем список переменных окружения
echo "📋 Список переменных окружения:"
vercel env ls

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Необходимые переменные окружения:"
echo ""
echo "✓ NEXT_PUBLIC_SUPABASE_URL"
echo "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "✓ SUPABASE_SERVICE_ROLE_KEY"
echo "✓ OPENAI_API_KEY"
echo "✓ PERPLEXITY_API_KEY"
echo "✓ TELEGRAM_BOT_TOKEN"
echo "✓ CRON_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

