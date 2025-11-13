# Подключение MoodFlow к новому проекту на Vercel

## ✅ Шаг 1: Подготовка завершена
Старая конфигурация Vercel удалена. Проект готов к подключению.

## 🚀 Шаг 2: Создание нового проекта на Vercel

### Вариант A: Через CLI (Рекомендуется)

```bash
cd /Users/d.chistoforov/Desktop/MoodFlow
vercel
```

CLI задаст вопросы:
1. **Set up and deploy?** → `Y` (Yes)
2. **Which scope?** → Выберите ваш аккаунт/команду
3. **Link to existing project?** → `N` (No - создаем новый)
4. **What's your project's name?** → `moodflow` (или другое имя)
5. **In which directory is your code located?** → `./` (текущая директория)
6. **Want to override settings?** → `N` (No - использовать авто-настройки)

### Вариант B: Через веб-интерфейс Vercel

1. Откройте https://vercel.com/new
2. Импортируйте репозиторий: `github.com/Chistoforov/moodflow`
3. Настройте проект (см. настройки ниже)

## 🔧 Шаг 3: Настройка переменных окружения

### Обязательные переменные:

```bash
NEXT_PUBLIC_SUPABASE_URL=ваш_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key
NEXT_PUBLIC_APP_URL=https://ваш-проект.vercel.app
OPENAI_API_KEY=ваш_openai_api_key
PERPLEXITY_API_KEY=ваш_perplexity_api_key
```

### Как добавить через CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add OPENAI_API_KEY production
vercel env add PERPLEXITY_API_KEY production
```

### Как добавить через веб-интерфейс:

1. Откройте настройки проекта: https://vercel.com/ваш-аккаунт/moodflow/settings/environment-variables
2. Добавьте каждую переменную
3. Выберите окружение: **Production**, **Preview**, **Development**

## ⚙️ Шаг 4: Настройки проекта Vercel

Убедитесь, что в настройках проекта указано:

### Build Settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Root Directory**: `./` (корень проекта)

### Важно для MoodFlow:
В файле `vercel.json` уже настроено:
```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": ".next"
}
```

## 🗄️ Шаг 5: Настройка Supabase

После деплоя обновите Supabase:

### 1. Обновите URL в Supabase Dashboard:
   - Перейдите в Authentication → URL Configuration
   - Добавьте: `https://ваш-новый-проект.vercel.app/api/auth/callback`

### 2. Примените миграции (если еще не применены):

```sql
-- В Supabase SQL Editor выполните:
-- supabase/migrations/022_add_admin_users_policy.sql
-- supabase/migrations/023_add_admin_daily_entries_policy.sql
-- supabase/migrations/024_create_monthly_analytics.sql
```

## 📋 Шаг 6: Настройка Cron Jobs

### Через vercel.json (уже настроено):
Файл `vercel.json` содержит настройку cron, но нужно активировать в dashboard.

### Активация в Vercel Dashboard:
1. Откройте: Settings → Cron Jobs
2. Включите cron job для `/api/cron/monthly-analytics`
3. Расписание: `0 0 * * 0` (каждое воскресенье в полночь)

## 🚀 Шаг 7: Первый деплой

```bash
# Деплой в production
vercel --prod

# Или просто
vercel
```

## ✅ Проверка после деплоя

1. **Проверьте главную страницу**: https://ваш-проект.vercel.app
2. **Проверьте авторизацию**: /login
3. **Проверьте API**: /api/posts
4. **Проверьте админ панель**: /admin (если у вас есть админ права)

## 🔍 Отладка

### Просмотр логов:
```bash
vercel logs ваш-проект.vercel.app
```

### Проверка переменных окружения:
```bash
vercel env ls
```

### Повторный деплой:
```bash
vercel --force
```

## 📝 Важные замечания

1. **NEXT_PUBLIC_APP_URL** должен соответствовать вашему Vercel URL
2. Все секретные ключи должны быть добавлены как переменные окружения
3. После первого деплоя обновите callback URL в Supabase
4. Настройте cron jobs для автоматической аналитики

## 🆘 Если что-то пошло не так

### Ошибка сборки:
```bash
# Проверьте локально
npm run build
```

### Ошибка с переменными окружения:
```bash
# Проверьте все переменные
vercel env ls
```

### Переподключение к проекту:
```bash
rm -rf .vercel
vercel link
```

## 📞 Готово!

После выполнения всех шагов ваше приложение будет доступно на новом Vercel проекте! 🎉


