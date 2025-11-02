# 🔧 Настройка Environment переменных

## 📝 Быстрая инструкция

### 1. Скопируйте шаблон

```bash
cd /Users/d.chistoforov/Desktop/MoodFlow/moodflow
cp .env.template .env.local
```

### 2. Откройте файл для редактирования

```bash
nano .env.local
# или используйте любой редактор
```

### 3. Заполните обязательные переменные

## 🔑 Обязательные переменные (минимум для запуска)

### Supabase

Зайдите на [supabase.com](https://supabase.com) и создайте проект:

```bash
# 1. Project URL - найдите в Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co

# 2. Anon Key - найдите в Settings → API → Project API keys → anon
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# 3. Service Role Key - найдите там же, но в разделе service_role
# ⚠️ ВАЖНО: Храните в секрете!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 4. URL приложения
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Пример заполненного .env.local (только обязательные)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY1MTIwMDAsImV4cCI6MjAxMjA4ODAwMH0.XXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NjUxMjAwMCwiZXhwIjoyMDEyMDg4MDAwfQ.YYY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 После создания .env.local

### 1. Настройте базу данных

Откройте Supabase SQL Editor и выполните миграцию:

```sql
-- Скопируйте весь код из файла:
-- supabase/migrations/001_initial_schema.sql
```

### 2. Включите Email Authentication

В Supabase:
- Authentication → Providers
- Найдите Email
- Включите Toggle

### 3. Запустите проект

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🔧 Опциональные переменные (для продакшена)

### Perplexity AI (для ИИ-анализа)

```bash
# Получите на https://www.perplexity.ai
PERPLEXITY_API_KEY=pplx-...
```

### Telegram (для уведомлений)

```bash
# Создайте бота через @BotFather в Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Stripe (для платежей)

```bash
# Получите на https://stripe.com → Developers
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Создайте Products в Stripe Dashboard
STRIPE_PRICE_SUBSCRIPTION=price_...
STRIPE_PRICE_PERSONAL=price_...
```

### Cron Jobs Secret

```bash
# Любая случайная строка
CRON_SECRET=your_random_secret_string_here
```

## 🔒 Безопасность

### ⚠️ ВАЖНО:

1. **Никогда** не коммитьте `.env.local` в git
2. **Никогда** не публикуйте `SUPABASE_SERVICE_ROLE_KEY`
3. **Никогда** не публикуйте `STRIPE_SECRET_KEY`
4. Используйте разные ключи для development и production

### Проверьте .gitignore

Убедитесь, что в `.gitignore` есть:

```
.env.local
.env*.local
```

## 🆘 Частые проблемы

### "Supabase URL not found"

- Проверьте, что файл называется именно `.env.local`
- Перезапустите dev server: `Ctrl+C` → `npm run dev`
- Проверьте, что переменные начинаются с `NEXT_PUBLIC_` для клиента

### "Invalid API key"

- Убедитесь, что скопировали ключ полностью (они очень длинные!)
- Проверьте, что нет лишних пробелов

### Ошибки при запросах к API

- Проверьте, что выполнили SQL миграцию
- Проверьте RLS policies в Supabase
- Проверьте, что Email provider включен

## 📋 Чек-лист перед запуском

- [ ] Создан файл `.env.local`
- [ ] Заполнены `NEXT_PUBLIC_SUPABASE_URL` и ключи
- [ ] Выполнена SQL миграция в Supabase
- [ ] Включен Email provider
- [ ] Запущен `npm run dev`
- [ ] Открыт http://localhost:3000
- [ ] Проверена регистрация через email

---

**Готово! Теперь можно запускать проект! 🚀**

