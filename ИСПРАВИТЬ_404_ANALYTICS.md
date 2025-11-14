# Исправление ошибки 404 для /api/admin/analytics/manual

## Проблема
При попытке запустить ручной анализ на production (moodflow-six.vercel.app) возникает ошибка:
```
POST https://moodflow-six.vercel.app/api/admin/analytics/manual 404 (Not Found)
```

## Решение

### Шаг 1: Проверить настройки Root Directory в Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект **moodflow-six**
3. Перейдите в **Settings** → **General**
4. Найдите секцию **Root Directory**
5. **Убедитесь, что Root Directory пустой (оставьте `.`) или вообще не задан**

❌ **НЕПРАВИЛЬНО**: Root Directory = `moodflow`  
✅ **ПРАВИЛЬНО**: Root Directory = `.` (или пустой)

### Шаг 2: Проверить переменные окружения

1. В Vercel Dashboard → **Settings** → **Environment Variables**
2. Убедитесь, что все необходимые переменные установлены:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `PERPLEXITY_API_KEY`

### Шаг 3: Очистить кеш и пересобрать

1. В Vercel Dashboard → **Deployments**
2. Найдите последний деплой
3. Нажмите на три точки ⋯ → **Redeploy** → **Use existing Build Cache** → **ОТКЛЮЧИТЕ чекбокс**
4. Нажмите **Redeploy**

ИЛИ через CLI:

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в аккаунт
vercel login

# Пересоберите с очисткой кеша
vercel --prod --force
```

### Шаг 4: Проверить структуру файлов в деплое

1. После успешного деплоя откройте **Deployment Details**
2. Перейдите на вкладку **Source**
3. Убедитесь, что файл `/src/app/api/admin/analytics/manual/route.ts` присутствует

### Шаг 5: Проверить логи функции

1. Откройте страницу админ панели в браузере
2. Попробуйте запустить анализ для пользователя
3. Вернитесь в Vercel Dashboard → **Logs** (или **Functions**)
4. Посмотрите логи для `/api/admin/analytics/manual`

## Если проблема сохраняется

### Проверка 1: Убедитесь, что файл закоммичен

```bash
git status
git log --oneline -1 -- src/app/api/admin/analytics/manual/route.ts
```

Должно показать:
```
b19fb01 feat: добавлен API для ручного анализа пользователей и исправлены RLS политики для monthly_analytics
```

### Проверка 2: Убедитесь, что коммит запушен

```bash
git log origin/main..HEAD
```

Должно быть пусто (нет незапушенных коммитов).

### Проверка 3: Проверьте локально

```bash
# Запустите локальный сервер
npm run dev

# В другом терминале (когда сервер запущен)
curl -X POST http://localhost:3000/api/admin/analytics/manual \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE"}' \
  -b "cookies_from_browser"
```

Если локально работает, значит проблема в конфигурации Vercel.

### Проверка 4: Пересоздайте проект Vercel (крайний случай)

Если ничего не помогает:

1. Создайте новый проект на Vercel
2. Импортируйте репозиторий заново
3. При настройке укажите:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (оставить пустым)
   - **Build Command**: `npm run build` (или оставить по умолчанию)
   - **Output Directory**: `.next` (или оставить по умолчанию)
4. Добавьте все переменные окружения
5. Задеплойте

## Тестирование после исправления

1. Откройте админ панель: https://moodflow-six.vercel.app/admin/users
2. Выберите пользователя с минимум 3 записями
3. Нажмите кнопку "Запустить анализ"
4. Должно появиться сообщение:
   ```
   ✅ Анализ успешно создан! Проанализировано X дней и Y записей.
   ```

## Возможные ошибки после исправления 404

Если API найден, но возникают другие ошибки:

### Ошибка 401 "Unauthorized"
→ Проблема с аутентификацией. Перелогиньтесь в приложении.

### Ошибка 403 "Forbidden: Admin access required"
→ Ваш пользователь не имеет роли admin в таблице `psychologists`.

**Решение**: Выполните SQL в Supabase Dashboard:
```sql
-- Проверьте вашего пользователя
SELECT u.email, p.role, p.active
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'ваш_email@example.com';

-- Если роль не admin, обновите:
UPDATE psychologists
SET role = 'admin', active = true
WHERE user_id = (
  SELECT sso_uid FROM users WHERE email = 'ваш_email@example.com'
);
```

### Ошибка 400 "Not enough entries for analysis"
→ У выбранного пользователя меньше 3 записей в текущем месяце.

### Ошибка 500 "new row violates row-level security policy"
→ Нужно применить миграции для RLS политик. См. `ИСПРАВЛЕНИЕ_ANALYTICS_RLS.md`.

---

**Дата**: 2025-11-13  
**Статус**: Удалена конфликтующая папка `moodflow/`, готово к редеплою

## Быстрое исправление (TL;DR)

```bash
# 1. Убедитесь, что папка moodflow/ удалена (уже сделано)
rm -rf moodflow/

# 2. Перейдите в Vercel Dashboard → Settings → General
# 3. Root Directory должен быть ПУСТОЙ или "."
# 4. Vercel Dashboard → Deployments → Последний деплой → Redeploy (без кеша)

# ИЛИ через CLI:
vercel --prod --force
```

**Основная причина**: Дублирующая папка `moodflow/` с собственным `vercel.json` конфликтовала с главным приложением и ломала маршрутизацию API.


