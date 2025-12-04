# 🚀 Быстрый деплой на Vercel

## 📦 Ваш домен: `moodflow-ashen.vercel.app`

## Шаг 1: Подготовка проекта

Убедитесь, что проект собирается:

```bash
cd /Users/d.chistoforov/Desktop/MoodFlow/moodflow
npm run build
```

## Шаг 2: Импорт на Vercel

### Через Dashboard (рекомендуется):

1. Зайдите на [vercel.com](https://vercel.com) и войдите
2. Нажмите **"Add New Project"**
3. Импортируйте ваш GitHub/GitLab/Bitbucket репозиторий
   - Если репозиторий в корне, убедитесь что **Root Directory** = `moodflow`
   - Если репозиторий уже содержит только moodflow, оставьте как есть
4. В настройках Framework Preset должен быть **Next.js**

### Через CLI:

```bash
npm i -g vercel
cd /Users/d.chistoforov/Desktop/MoodFlow/moodflow
vercel login
vercel
```

## Шаг 3: Настройка переменных окружения

В Vercel Dashboard → **Settings → Environment Variables** добавьте:

### ✅ Обязательные:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key
NEXT_PUBLIC_APP_URL=https://moodflow-ashen.vercel.app
```

### ⚙️ Опциональные (если используете):

```bash
PERPLEXITY_API_KEY=pplx-...
TELEGRAM_BOT_TOKEN=1234567890:ABC...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_SUBSCRIPTION=price_...
STRIPE_PRICE_PERSONAL=price_...
CRON_SECRET=ваш_секретный_ключ
```

**Важно:**
- Для `NEXT_PUBLIC_*` выберите все окружения (Production, Preview, Development)
- Для секретных ключей (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `CRON_SECRET`) только Production

## Шаг 4: Настройка домена

1. Vercel автоматически создаст домен `moodflow-ashen.vercel.app` при первом деплое
2. Или в **Settings → Domains** добавьте домен вручную
3. Домены `.vercel.app` настраиваются автоматически

## Шаг 5: Настройка Supabase ⚠️ КРИТИЧНО

После деплоя **ОБЯЗАТЕЛЬНО** обновите настройки в Supabase:

1. **Supabase Dashboard → Authentication → URL Configuration**:
   
   - **Site URL**: 
     ```
     https://moodflow-ashen.vercel.app
     ```
   
   - **Redirect URLs** (добавьте каждый на новой строке):
     ```
     https://moodflow-ashen.vercel.app/api/auth/callback
     https://moodflow-ashen.vercel.app/**
     http://localhost:3000/api/auth/callback
     http://localhost:3000/**
     ```
   
   **Важно:**
   - Используйте точный формат с `**` для wildcard
   - Каждый URL на отдельной строке
   - Обязательно сохраните изменения (кнопка Save)

2. **Email Templates** (опционально):
   - **Authentication → Email Templates → Magic Link**
   - Убедитесь, что используется:
     ```
     {{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=magiclink
     ```

3. **Settings → API**:
   - Убедитесь, что CORS разрешает ваш домен

**Если не настроите Redirect URLs, авторизация не будет работать!**

## Шаг 6: Деплой

### Через Dashboard:
- Нажмите **"Deploy"** или просто сделайте push в основную ветку

### Через CLI:
```bash
vercel --prod
```

## ✅ Проверка

После деплоя проверьте:

1. ✅ Главная страница: `https://moodflow-ashen.vercel.app`
2. ✅ Авторизация работает
3. ✅ API endpoints отвечают
4. ✅ Supabase подключен

## 🔄 Автоматический деплой

После настройки:
- Каждый push в `main`/`master` → автоматический production деплой
- Другие ветки → preview deployments

## 🐛 Если что-то не работает

### Проблемы с авторизацией

Если при переходе по ссылке из email получаете ошибку:
```
Application error: a server-side exception has occurred
```

**Решение:** См. подробную инструкцию в [AUTH_CALLBACK_FIX.md](./AUTH_CALLBACK_FIX.md)

**Быстрая проверка:**
1. ✅ Supabase Redirect URLs включают `/api/auth/callback`
2. ✅ Site URL = `https://moodflow-ashen.vercel.app`
3. ✅ Переменные окружения правильные
4. ✅ Последние изменения задеплоены

### Другие проблемы

1. Проверьте логи билда в Vercel Dashboard
2. Убедитесь, что все переменные окружения заданы
3. Проверьте настройки Supabase (URL Configuration)
4. Убедитесь, что `NEXT_PUBLIC_APP_URL` = `https://moodflow-ashen.vercel.app`
5. Попробуйте очистить cookies и использовать режим инкогнито

---

**Готово! 🎉 Ваше приложение доступно на https://moodflow-ashen.vercel.app**

