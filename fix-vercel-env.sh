#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Проверка переменных окружения на Vercel...${NC}\n"

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI не установлен!${NC}"
    echo -e "Установите его командой: ${GREEN}npm i -g vercel${NC}\n"
    exit 1
fi

# Проверяем, авторизован ли пользователь
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Необходима авторизация в Vercel${NC}"
    echo -e "Выполните: ${GREEN}vercel login${NC}\n"
    vercel login
fi

echo -e "${GREEN}✅ Vercel CLI готов к работе${NC}\n"

# Проверяем локальные переменные окружения
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Файл .env.local не найден!${NC}"
    echo -e "Создайте его на основе .env.example\n"
    exit 1
fi

echo -e "${YELLOW}📋 Найденные локальные переменные окружения:${NC}\n"

# Читаем переменные из .env.local
while IFS= read -r line; do
    # Пропускаем комментарии и пустые строки
    if [[ ! "$line" =~ ^#.*$ ]] && [[ -n "$line" ]]; then
        VAR_NAME=$(echo "$line" | cut -d '=' -f 1)
        if [[ -n "$VAR_NAME" ]]; then
            echo "  • $VAR_NAME"
        fi
    fi
done < .env.local

echo -e "\n${YELLOW}🚀 Хотите загрузить эти переменные в Vercel?${NC}"
echo -e "Это добавит их для Production, Preview и Development окружений."
read -p "Продолжить? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏭️  Пропускаем загрузку переменных${NC}"
    exit 0
fi

echo -e "\n${GREEN}📤 Загружаем переменные на Vercel...${NC}\n"

# Загружаем переменные на Vercel
while IFS= read -r line; do
    # Пропускаем комментарии и пустые строки
    if [[ ! "$line" =~ ^#.*$ ]] && [[ -n "$line" ]]; then
        VAR_NAME=$(echo "$line" | cut -d '=' -f 1)
        VAR_VALUE=$(echo "$line" | cut -d '=' -f 2-)
        
        if [[ -n "$VAR_NAME" ]] && [[ -n "$VAR_VALUE" ]]; then
            echo -e "  Добавляем: ${GREEN}$VAR_NAME${NC}"
            
            # Удаляем существующую переменную (если есть)
            vercel env rm "$VAR_NAME" production -y 2>/dev/null
            vercel env rm "$VAR_NAME" preview -y 2>/dev/null
            vercel env rm "$VAR_NAME" development -y 2>/dev/null
            
            # Добавляем новую переменную для всех окружений
            echo "$VAR_VALUE" | vercel env add "$VAR_NAME" production > /dev/null 2>&1
            echo "$VAR_VALUE" | vercel env add "$VAR_NAME" preview > /dev/null 2>&1
            echo "$VAR_VALUE" | vercel env add "$VAR_NAME" development > /dev/null 2>&1
        fi
    fi
done < .env.local

echo -e "\n${GREEN}✅ Переменные окружения загружены!${NC}\n"

echo -e "${YELLOW}🔄 Запускаем новый деплой...${NC}\n"
vercel --prod

echo -e "\n${GREEN}✅ Готово!${NC}"
echo -e "Проверьте ваш сайт через несколько минут.\n"

