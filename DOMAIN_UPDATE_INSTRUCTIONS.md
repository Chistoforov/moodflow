# 🔄 Инструкция по обновлению домена

Приложение переехало на новый домен: **moodflow-ashen.vercel.app**

## ⚠️ Проблема
После SSO логина происходит редирект на старый домен `moodflow-six.vercel.app`, где возникает ошибка 404.

## ✅ Решение

### 1. Обновите переменные окружения в Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект **MoodFlow**
3. Перейдите в **Settings** → **Environment Variables**
4. Найдите переменную `NEXT_PUBLIC_APP_URL`
5. Измените значение на:
   ```
   https://moodflow-ashen.vercel.app
   ```
6. Нажмите **Save**
7. **Важно!** Сделайте redeploy проекта:
   - Перейдите в **Deployments**
   - Найдите последний деплой
   - Нажмите на три точки → **Redeploy**

### 2. Обновите настройки в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект **MoodFlow**
3. Перейдите в **Authentication** → **URL Configuration**
4. Обновите **Site URL**:
   ```
   https://moodflow-ashen.vercel.app
   ```
5. Обновите **Redirect URLs** (добавьте или замените):
   ```
   https://moodflow-ashen.vercel.app/api/auth/callback
   https://moodflow-ashen.vercel.app/**
   http://localhost:3000/api/auth/callback
   http://localhost:3000/**
   ```
6. **Нажмите Save!** ⚠️

### 3. (Если используется Google OAuth) Обновите Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите OAuth 2.0 Client ID для MoodFlow
5. В **Authorized JavaScript origins** добавьте:
   ```
   https://moodflow-ashen.vercel.app
   ```
   (Удалите старый домен `https://moodflow-six.vercel.app`)
   
6. В **Authorized redirect URIs** добавьте:
   ```
   https://moodflow-ashen.vercel.app/api/auth/callback
   ```
   (Удалите старый домен)
   
7. Нажмите **Save**

### 4. Проверка

1. Откройте новый домен: https://moodflow-ashen.vercel.app
2. Попробуйте войти через Google SSO
3. После успешного входа вы должны остаться на домене `moodflow-ashen.vercel.app`

## 📝 Что было обновлено в коде

✅ Все упоминания старого домена в документации заменены на новый:
- GOOGLE_SSO_SETUP.md
- QUICK_FIX_STEPS.md
- DEPLOY_QUICKSTART.md
- AUTH_CALLBACK_FIX.md
- VERCEL_DEPLOY.md
- CHECK_ADMIN_VERCEL.md
- FIX_POSTS_ERROR.md

## 🎉 Готово!

После выполнения всех шагов SSO логин будет корректно работать на новом домене.
