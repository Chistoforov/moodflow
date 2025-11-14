# 🚀 Быстрая настройка нового проекта Vercel

## Простой путь (3 команды)

```bash
# 1. Создать новый проект и задеплоить
./setup-vercel.sh

# 2. Добавить переменные окружения
./add-vercel-env.sh

# 3. Задеплоить в production
vercel --prod
```

## Или пошагово:

### Шаг 1: Создание проекта
```bash
vercel
```
Ответьте на вопросы:
- Set up and deploy? → **Y**
- Which scope? → **Выберите ваш аккаунт**
- Link to existing project? → **N** (создаем новый)
- Project name? → **moodflow** (или другое имя)
- In which directory? → **./** (нажмите Enter)
- Override settings? → **N**

### Шаг 2: Добавление переменных окружения

**Вариант A - Автоматически:**
```bash
./add-vercel-env.sh
```

**Вариант B - Вручную:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add OPENAI_API_KEY production
vercel env add PERPLEXITY_API_KEY production
```

### Шаг 3: Production деплой
```bash
vercel --prod
```

## После деплоя

1. **Обновите Supabase callback URL:**
   - Перейдите в Supabase Dashboard → Authentication → URL Configuration
   - Добавьте: `https://ваш-проект.vercel.app/api/auth/callback`

2. **Примените миграции базы данных** (если еще не применены):
   - 022_add_admin_users_policy.sql
   - 023_add_admin_daily_entries_policy.sql
   - 024_create_monthly_analytics.sql

3. **Настройте Cron Jobs:**
   - Vercel Dashboard → Settings → Cron Jobs
   - Включите `/api/cron/monthly-analytics`

## Проверка

```bash
# Проверить переменные окружения
vercel env ls

# Проверить логи
vercel logs

# Открыть в браузере
vercel open
```

## Полная документация

См. `VERCEL_NEW_PROJECT_SETUP.md` для подробной инструкции.

---

✅ Готово! Ваш MoodFlow задеплоен на новом Vercel проекте! 🎉



