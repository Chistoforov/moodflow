#!/bin/bash

# Скрипт для применения миграций monthly_analytics
# 
# Использование:
#   chmod +x apply-analytics-migrations.sh
#   ./apply-analytics-migrations.sh

set -e

echo "🔧 Применение миграций для monthly_analytics"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Шаг 1: Проверка Supabase CLI${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI не установлен${NC}"
    echo "Установите с помощью: brew install supabase/tap/supabase"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI установлен${NC}"
echo ""

echo -e "${YELLOW}Шаг 2: Проверка локального Supabase${NC}"
if ! supabase status &> /dev/null; then
    echo -e "${RED}❌ Локальный Supabase не запущен${NC}"
    echo "Запустите с помощью: supabase start"
    exit 1
fi
echo -e "${GREEN}✅ Локальный Supabase запущен${NC}"
echo ""

echo -e "${YELLOW}Шаг 3: Проверка существующих миграций${NC}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
SELECT version, name 
FROM supabase_migrations.schema_migrations 
WHERE name LIKE '%monthly_analytics%' 
ORDER BY version;
" 2>/dev/null || echo "Нет существующих миграций monthly_analytics"
echo ""

echo -e "${YELLOW}Шаг 4: Удаление старой таблицы (если есть)${NC}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres <<SQL
-- Удалить существующие политики
DROP POLICY IF EXISTS "Admins can insert monthly analytics for any user" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can update monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can delete monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Users can read their own monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Service role can manage monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Users can insert their own monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can read all monthly analytics" ON public.monthly_analytics;

-- Удалить триггеры
DROP TRIGGER IF EXISTS update_monthly_analytics_updated_at ON public.monthly_analytics;
DROP FUNCTION IF EXISTS update_monthly_analytics_updated_at();

-- Удалить таблицу
DROP TABLE IF EXISTS public.monthly_analytics CASCADE;
SQL

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Старая таблица удалена${NC}"
else
    echo -e "${YELLOW}⚠️  Таблица не существовала или произошла ошибка${NC}"
fi
echo ""

echo -e "${YELLOW}Шаг 5: Применение миграции 024 (создание таблицы)${NC}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < supabase/migrations/024_create_monthly_analytics_fixed.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Миграция 024 применена успешно${NC}"
else
    echo -e "${RED}❌ Ошибка применения миграции 024${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Шаг 6: Применение миграции 025 (RLS политики для админов)${NC}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < supabase/migrations/025_fix_monthly_analytics_admin_insert_fixed.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Миграция 025 применена успешно${NC}"
else
    echo -e "${RED}❌ Ошибка применения миграции 025${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Шаг 7: Проверка RLS политик${NC}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'monthly_analytics'
ORDER BY policyname;
"
echo ""

echo -e "${YELLOW}Шаг 8: Проверка структуры таблицы${NC}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'monthly_analytics'
  AND table_schema = 'public'
ORDER BY ordinal_position;
"
echo ""

echo -e "${GREEN}🎉 Миграции применены успешно!${NC}"
echo ""
echo -e "${YELLOW}Следующие шаги:${NC}"
echo "1. Перезапустите dev сервер: npm run dev"
echo "2. Откройте админ панель и протестируйте создание анализа"
echo "3. Проверьте логи в консоли"
echo ""
echo -e "${YELLOW}Для production (Vercel):${NC}"
echo "1. Откройте Supabase Dashboard > SQL Editor"
echo "2. Выполните содержимое файла 024_create_monthly_analytics_fixed.sql"
echo "3. Выполните содержимое файла 025_fix_monthly_analytics_admin_insert_fixed.sql"
echo "4. Задеплойте изменения: git push origin main"


