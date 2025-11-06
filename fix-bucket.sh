#!/bin/bash

# Скрипт для исправления ошибки "Bucket not found"
# Этот скрипт поможет вам создать bucket в Supabase

echo "🔧 Исправление ошибки 'Bucket not found'"
echo ""
echo "Этот скрипт поможет вам создать bucket 'audio-entries' в Supabase."
echo ""
echo "📋 Инструкция:"
echo ""
echo "1. Откройте Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Выберите ваш проект"
echo "3. Перейдите в SQL Editor"
echo "4. Откройте файл create-bucket.sql в этом проекте"
echo "5. Скопируйте содержимое и вставьте в SQL Editor"
echo "6. Нажмите Run (или Cmd/Ctrl + Enter)"
echo ""
echo "✅ После выполнения SQL запроса bucket будет создан и ошибка исчезнет."
echo ""
echo "📖 Подробные инструкции: см. FIX_BUCKET_ERROR.md"
echo ""
echo "Открыть файл create-bucket.sql? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    if command -v open &> /dev/null; then
        open create-bucket.sql
    elif command -v xdg-open &> /dev/null; then
        xdg-open create-bucket.sql
    else
        echo "Файл create-bucket.sql находится в корне проекта"
    fi
fi

