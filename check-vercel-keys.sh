#!/bin/bash

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Проверка переменных окружения на Vercel${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# Проверяем Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI не установлен${NC}"
    echo -e "Установите: ${GREEN}npm i -g vercel${NC}\n"
    exit 1
fi

# Проверяем авторизацию
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Необходима авторизация${NC}"
    vercel login
fi

echo -e "${GREEN}✅ Подключен к Vercel${NC}\n"

# Получаем список переменных
echo -e "${YELLOW}📋 Получаем список переменных окружения...${NC}\n"

ENV_LIST=$(vercel env ls production 2>&1)

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Проверка критичных переменных${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Функция проверки переменной
check_var() {
    local var_name=$1
    if echo "$ENV_LIST" | grep -q "$var_name"; then
        echo -e "  ✅ ${GREEN}$var_name${NC} - установлена"
        return 0
    else
        echo -e "  ❌ ${RED}$var_name${NC} - ОТСУТСТВУЕТ"
        return 1
    fi
}

# Счетчик ошибок
ERRORS=0

# Проверяем Supabase переменные
echo -e "${YELLOW}🔑 Supabase:${NC}"
check_var "NEXT_PUBLIC_SUPABASE_URL" || ((ERRORS++))
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" || ((ERRORS++))
check_var "SUPABASE_SERVICE_ROLE_KEY" || ((ERRORS++))

echo ""
echo -e "${YELLOW}🤖 AI сервисы:${NC}"
check_var "OPENAI_API_KEY" || ((ERRORS++))
check_var "PERPLEXITY_API_KEY" || ((ERRORS++))

echo ""
echo -e "${YELLOW}📱 Telegram:${NC}"
check_var "TELEGRAM_BOT_TOKEN" || ((ERRORS++))

echo ""
echo -e "${YELLOW}⏰ CRON:${NC}"
check_var "CRON_SECRET" || ((ERRORS++))

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Результат
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Все переменные установлены!${NC}\n"
else
    echo -e "${RED}❌ Найдено проблем: $ERRORS${NC}\n"
    echo -e "${YELLOW}Добавьте отсутствующие переменные:${NC}"
    echo -e "  ${BLUE}vercel env add <VARIABLE_NAME> production${NC}\n"
fi

# Проверяем последний деплой
echo -e "${YELLOW}📦 Проверяем последние деплои...${NC}\n"
vercel ls 2>&1 | head -n 5

echo ""
echo -e "${YELLOW}💡 Для просмотра логов последнего деплоя:${NC}"
echo -e "  ${BLUE}vercel logs --follow${NC}\n"

# Проверка на одинаковые ключи
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Важная проверка${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}⚠️  ВАЖНО: Проверьте, что ключи РАЗНЫЕ!${NC}\n"
echo -e "В Supabase есть ДВА разных ключа:"
echo -e "  ${GREEN}1. anon public${NC} → NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo -e "  ${GREEN}2. service_role${NC} → SUPABASE_SERVICE_ROLE_KEY\n"

echo -e "Если эти ключи ${RED}ОДИНАКОВЫЕ${NC} - это ошибка!"
echo -e "Смотрите инструкцию: ${BLUE}ПРАВИЛЬНЫЕ_КЛЮЧИ_SUPABASE.md${NC}\n"

echo -e "${BLUE}════════════════════════════════════════${NC}\n"

