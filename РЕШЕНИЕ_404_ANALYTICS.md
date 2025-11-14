# Решение проблемы 404 для /api/admin/analytics/manual

## Статус
**Дата**: 2025-11-13  
**Проблема**: POST запрос к `https://moodflow-six.vercel.app/api/admin/analytics/manual` возвращает 404

## Выполненные действия

### ✅ Проверено
1. **Файл существует локально**: `/Users/d.chistoforov/Desktop/MoodFlow/src/app/api/admin/analytics/manual/route.ts`
2. **Файл закоммичен**: Коммит `b19fb01 feat: добавлен API для ручного анализа...`
3. **Файл запушен**: Нет разницы между `origin/main` и `HEAD`
4. **Нет проблем с .gitignore или .vercelignore**: API файлы не игнорируются
5. **Структура правильная**: Другие API эндпоинты в `/src/app/api/admin/` работают

### 🔄 Решение
Создан пустой коммит для принудительного редеплоя:
```bash
git commit --allow-empty -m "chore: force rebuild to fix 404 for analytics API"
git push origin main
```

**Коммит**: `59c5b76`

## Что делать дальше

### 1. Подождите завершения деплоя
1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Найдите проект **moodflow-six**
3. Перейдите на вкладку **Deployments**
4. Дождитесь статуса **Ready** для последнего деплоя

### 2. Проверьте эндпоинт
После завершения деплоя проверьте через браузер:
```
https://moodflow-six.vercel.app/admin/users
```

Выберите пользователя с минимум 3 записями и нажмите "Запустить анализ".

### 3. Если проблема сохраняется

#### Вариант A: Проверить Root Directory в Vercel
1. Vercel Dashboard → Settings → General
2. **Root Directory** должен быть `.` или пустым
3. ❌ НЕ должно быть `moodflow` или другой папки

#### Вариант B: Redeploy без кеша
1. Vercel Dashboard → Deployments
2. Последний деплой → ⋯ → **Redeploy**
3. **ОТКЛЮЧИТЕ** "Use existing Build Cache"
4. Нажмите **Redeploy**

Или через CLI:
```bash
cd /Users/d.chistoforov/Desktop/MoodFlow
vercel --prod --force
```

#### Вариант C: Проверить переменные окружения
Vercel Dashboard → Settings → Environment Variables

Убедитесь, что все установлены:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `PERPLEXITY_API_KEY`

#### Вариант D: Локальное тестирование
```bash
# Запустите локальный dev сервер
npm run dev

# В другом терминале (требуется аутентификация)
curl -X POST http://localhost:3000/api/admin/analytics/manual \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE"}'
```

Если локально работает → проблема в Vercel конфигурации.  
Если локально не работает → проблема в коде (маловероятно, т.к. файл идентичен другим работающим эндпоинтам).

#### Вариант E: Проверить логи Vercel
1. Vercel Dashboard → Logs или Functions
2. Попробуйте сделать запрос к эндпоинту
3. Посмотрите, есть ли логи или ошибки

### 4. Последний вариант: пересоздать проект

Если ничего не помогает:
1. Создайте новый проект на Vercel
2. Импортируйте репозиторий заново
3. Framework Preset: **Next.js**
4. Root Directory: **`.`** (пусто)
5. Добавьте все переменные окружения
6. Задеплойте

## Возможные причины

### 1. Кеш сборки
Vercel может использовать старый кеш, в котором еще нет нового файла.
**Решение**: Force redeploy без кеша

### 2. Root Directory
Если Root Directory установлен неправильно, Vercel может не видеть файлы API.
**Решение**: Установить Root Directory в `.` или оставить пустым

### 3. Конфликт маршрутов
Возможно, есть конфликт с другим маршрутом или middleware.
**Решение**: Проверить нет ли middleware.ts, который блокирует маршрут

### 4. Next.js 16.0.1 особенности
Возможно, в новой версии Next.js изменилась работа App Router.
**Решение**: Проверить документацию Next.js 16 или откатиться на 15.x

### 5. Vercel Platform Issue
Редко, но иногда могут быть проблемы на стороне платформы.
**Решение**: Создать support ticket в Vercel

## Тестирование после исправления

### Успешный результат
```json
{
  "message": "Analysis completed successfully",
  "analysis": { ... },
  "metadata": {
    "userId": "...",
    "userName": "...",
    "weekNumber": 2,
    "daysAnalyzed": 13,
    "entriesAnalyzed": 5,
    "isFinal": false,
    "month": 11,
    "year": 2025
  }
}
```

### Возможные ошибки

#### 401 Unauthorized
→ Нет аутентификации. Перелогиньтесь.

#### 403 Forbidden: Admin access required
→ Пользователь не admin. Выполните в Supabase:
```sql
UPDATE psychologists
SET role = 'admin', active = true
WHERE user_id = (SELECT sso_uid FROM users WHERE email = 'ваш_email');
```

#### 400 Not enough entries for analysis
→ У пользователя меньше 3 записей в текущем месяце.

#### 500 new row violates row-level security policy
→ Нужно применить миграции 024 и 025. См. `ПРИМЕНИТЬ_МИГРАЦИИ_024_И_025.md`

## Полезные команды

```bash
# Проверить структуру
ls -la src/app/api/admin/analytics/

# Проверить коммиты
git log --oneline -5 -- src/app/api/admin/analytics/manual/route.ts

# Проверить незапушенные коммиты
git log origin/main..HEAD

# Force push (только если нужно)
git push origin main --force  # ❌ Осторожно!

# Локальная сборка
npm run build
npm start

# Проверить Vercel CLI
vercel --version
vercel ls

# Принудительный деплой
vercel --prod --force
```

## Контакты

Если ничего не помогает:
- [Vercel Support](https://vercel.com/support)
- [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)
- [Supabase Discord](https://discord.supabase.com)

---

**Следующий шаг**: Подождите ~2-5 минут завершения деплоя на Vercel и проверьте эндпоинт снова.


