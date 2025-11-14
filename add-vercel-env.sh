#!/bin/bash

# Скрипт для добавления переменных окружения в Vercel

echo "🔐 Добавление переменных окружения в Vercel"
echo "=========================================="
echo ""

# Проверяем наличие .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Файл .env.local не найден"
    exit 1
fi

echo "📋 Найдены следующие переменные в .env.local:"
echo ""
grep -E "^[A-Z_]+=" .env.local | sed 's/=.*//' | while read var; do
    echo "  - $var"
done
echo ""

# Спрашиваем подтверждение
read -p "Добавить все переменные в Vercel Production? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Отменено"
    exit 0
fi

echo ""
echo "Добавление переменных..."
echo ""

# Читаем переменные из .env.local и добавляем в Vercel
while IFS='=' read -r key value; do
    # Пропускаем пустые строки и комментарии
    if [[ -z "$key" ]] || [[ "$key" =~ ^# ]]; then
        continue
    fi
    
    # Удаляем пробелы и кавычки из значения
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    echo "Добавляю: $key"
    echo "$value" | vercel env add "$key" production --force
    
    if [ $? -eq 0 ]; then
        echo "  ✅ $key добавлен"
    else
        echo "  ⚠️  Ошибка при добавлении $key"
    fi
    echo ""
done < <(grep -E "^[A-Z_]+=" .env.local)

echo ""
echo "=========================================="
echo "✅ Готово!"
echo ""
echo "Проверить переменные:"
echo "  vercel env ls"
echo ""
echo "Задеплоить с новыми переменными:"
echo "  vercel --prod"
echo "=========================================="



