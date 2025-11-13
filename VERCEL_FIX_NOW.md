# 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ ОШИБКИ MIDDLEWARE

## ✅ ЧТО ИСПРАВЛЕНО

Файл `middleware.ts` был обновлен для более стабильной работы на Vercel Edge Runtime.

## Проблема
Ошибка `MIDDLEWARE_INVOCATION_FAILED` означает, что на Vercel **НЕ УСТАНОВЛЕНЫ** переменные окружения.

## ⚡ БЫСТРОЕ РЕШЕНИЕ (2 минуты)

**Смотрите файл** `БЫСТРОЕ_ИСПРАВЛЕНИЕ.md` для минимальной настройки.

## 📚 ПОЛНОЕ РЕШЕНИЕ (5-10 минут)

### Шаг 1: Откройте Vercel
1. Перейдите на https://vercel.com
2. Откройте ваш проект
3. **Settings** → **Environment Variables**

### Шаг 2: Добавьте ВСЕ эти переменные

**Важно:** Для КАЖДОЙ переменной выберите **все окружения** (Production, Preview, Development)

#### 1. Supabase переменные (ОБЯЗАТЕЛЬНО!)

```
NEXT_PUBLIC_SUPABASE_URL
Значение: https://ваш-проект.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Значение: ваш-anon-ключ (длинный JWT токен)
```

```
SUPABASE_SERVICE_ROLE_KEY
Значение: ваш-service-role-ключ (длинный JWT токен)
```

**Где найти эти ключи:**
- Зайдите на https://supabase.com
- Откройте ваш проект
- **Project Settings** → **API**
- Скопируйте URL и ключи

#### 2. OpenAI (ОБЯЗАТЕЛЬНО!)

```
OPENAI_API_KEY
Значение: sk-...
```

#### 3. Perplexity (ОБЯЗАТЕЛЬНО!)

```
PERPLEXITY_API_KEY
Значение: ваш-perplexity-ключ
```

#### 4. Telegram (ОБЯЗАТЕЛЬНО!)

```
TELEGRAM_BOT_TOKEN
Значение: ваш-telegram-токен
```

#### 5. CRON Secret (ОБЯЗАТЕЛЬНО!)

```
CRON_SECRET
Значение: любая случайная строка (например: my-secret-cron-key-123)
```

### Шаг 3: Redeploy

После добавления ВСЕХ переменных:
1. Перейдите в **Deployments**
2. Нажмите на последний деплой
3. Нажмите три точки (⋯) → **Redeploy**

## ✅ Проверка

После redeploy:
1. Откройте ваш сайт
2. Если все правильно - ошибка исчезнет
3. Если нет - смотрите логи:
   - **Deployments** → кликните на деплой → **Runtime Logs**
   - Найдите сообщение "Missing Supabase environment variables"

## 🆘 Если не помогло

1. **Проверьте, что ВСЕ переменные добавлены** для всех окружений (Production, Preview, Development)
2. **Проверьте Runtime Logs** на наличие других ошибок
3. Убедитесь, что Supabase URL и ключи правильные (скопируйте их заново)

## 📝 Автоматическая установка через скрипт

Если у вас есть файл `.env.local`:

```bash
# Установите Vercel CLI
npm i -g vercel

# Авторизуйтесь
vercel login

# Свяжите проект
vercel link

# Запустите автоматическую установку
./fix-vercel-env.sh
```

Скрипт автоматически загрузит все переменные из `.env.local` на Vercel.

## 📝 Ручная установка через CLI

Если хотите добавить переменные вручную:

```bash
# Добавление переменных по одной
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add PERPLEXITY_API_KEY production
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add CRON_SECRET production

# Редеплой
vercel --prod
```

## 🎯 Главное

**БЕЗ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ПРИЛОЖЕНИЕ НЕ ЗАРАБОТАЕТ!**

Middleware пытается подключиться к Supabase, но не может, потому что нет URL и ключей.

После добавления переменных - обязательно сделайте **Redeploy**!


