# Исправление ошибки MIDDLEWARE_INVOCATION_FAILED

## Что было сделано

✅ Исправлен файл `middleware.ts`:
- Убраны проблемные импорты с path aliases
- Добавлена проверка переменных окружения
- Упрощена типизация

## Что нужно сделать

### 1. Проверьте переменные окружения на Vercel

Перейдите в **Project Settings → Environment Variables** и убедитесь, что установлены:

#### Обязательные переменные:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-ключ

# OpenAI
OPENAI_API_KEY=ваш-openai-ключ

# Perplexity
PERPLEXITY_API_KEY=ваш-perplexity-ключ

# Telegram
TELEGRAM_BOT_TOKEN=ваш-telegram-токен

# Stripe (если используете)
STRIPE_SECRET_KEY=ваш-stripe-ключ
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=ваш-stripe-publishable-ключ

# Vercel CRON Secret
CRON_SECRET=любой-случайный-секретный-ключ
```

**Важно:** Все переменные должны быть установлены для всех окружений (Production, Preview, Development)

### 2. Найдите ваши Supabase ключи

Зайдите в ваш Supabase проект:
1. Перейдите в **Project Settings → API**
2. Найдите:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Задеплойте изменения

После добавления переменных окружения:

```bash
# Закоммитьте изменения
git add .
git commit -m "fix: исправлен middleware для Vercel"
git push origin main
```

Vercel автоматически перезапустит деплой.

### 4. Проверьте логи на Vercel

Если ошибка все еще есть:
1. Перейдите в **Deployments**
2. Кликните на последний деплой
3. Перейдите в **Runtime Logs**
4. Проверьте, какие переменные отсутствуют

## Быстрая установка переменных через CLI

Если у вас установлен Vercel CLI:

```bash
# Установите переменные
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add PERPLEXITY_API_KEY
vercel env add TELEGRAM_BOT_TOKEN
vercel env add CRON_SECRET

# Перезапустите деплой
vercel --prod
```

## Проверка после деплоя

После успешного деплоя:
1. Откройте ваш сайт
2. Попробуйте зайти на любую страницу
3. Middleware должен работать корректно

## Если проблема остается

Проверьте в **Runtime Logs**:
- Есть ли сообщение "Missing Supabase environment variables"
- Какие еще ошибки есть в логах

Напишите мне, и мы исправим!

