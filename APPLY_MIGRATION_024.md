# 🚀 Применение Миграции 024: Месячная Аналитика

## Быстрый старт

### Вариант 1: Supabase Dashboard (Рекомендуется)

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект MoodFlow
3. Перейдите в **SQL Editor**
4. Нажмите **New Query**
5. Скопируйте содержимое файла `supabase/migrations/024_create_monthly_analytics.sql`
6. Вставьте в редактор
7. Нажмите **Run** или `Ctrl/Cmd + Enter`

### Вариант 2: Supabase CLI

```bash
# Убедитесь, что вы в корневой директории проекта
cd /Users/d.chistoforov/Desktop/MoodFlow

# Примените миграцию
supabase migration up

# Или примените конкретную миграцию
supabase db push
```

### Вариант 3: SQL напрямую (для опытных)

```bash
# Подключитесь к вашей базе данных
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Выполните SQL из файла
\i supabase/migrations/024_create_monthly_analytics.sql
```

## ✅ Проверка успешности

После применения миграции выполните в SQL Editor:

```sql
-- Проверка создания таблицы
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'monthly_analytics'
);
-- Должно вернуть: true

-- Проверка столбцов
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'monthly_analytics'
ORDER BY ordinal_position;

-- Проверка индексов
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'monthly_analytics';

-- Проверка RLS policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'monthly_analytics';
```

Ожидаемый результат:
- ✅ Таблица `monthly_analytics` создана
- ✅ Все столбцы на месте (18 столбцов)
- ✅ 2 индекса созданы
- ✅ 4 RLS политики активны
- ✅ Триггер `update_monthly_analytics_updated_at` работает

## 📊 Структура таблицы

```
monthly_analytics
├── id (UUID, PK)
├── user_id (UUID, FK → auth.users)
├── year (INTEGER)
├── month (INTEGER)
├── week_number (INTEGER)
├── days_analyzed (INTEGER)
├── analysis_text (TEXT)
├── general_impression (TEXT)
├── positive_trends (TEXT)
├── decline_reasons (TEXT)
├── recommendations (TEXT)
├── reflection_directions (TEXT)
├── perplexity_request_id (TEXT)
├── perplexity_response (JSONB)
├── is_final (BOOLEAN)
├── status (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Constraints:
- UNIQUE(user_id, year, month, week_number)

Indexes:
- idx_monthly_analytics_user_date
- idx_monthly_analytics_final

RLS Policies:
1. Users can read their own monthly analytics
2. Service role can manage monthly analytics
3. Users can insert their own monthly analytics
4. Admins can read all monthly analytics
```

## 🔍 Тестовые запросы

### Проверка прав доступа

```sql
-- Как обычный пользователь (замените YOUR_USER_ID)
SELECT * FROM monthly_analytics 
WHERE user_id = 'YOUR_USER_ID';
-- Должно работать

-- Попытка увидеть чужие данные
SELECT * FROM monthly_analytics 
WHERE user_id != auth.uid();
-- Должно быть пусто (если вы не админ)
```

### Тест вставки

```sql
-- Вставка тестовой записи (замените YOUR_USER_ID)
INSERT INTO monthly_analytics (
  user_id,
  year,
  month,
  week_number,
  days_analyzed,
  analysis_text,
  status
) VALUES (
  'YOUR_USER_ID',
  2024,
  11,
  1,
  7,
  'Test analysis',
  'completed'
);

-- Проверка
SELECT * FROM monthly_analytics 
WHERE user_id = 'YOUR_USER_ID';

-- Удаление тестовой записи
DELETE FROM monthly_analytics 
WHERE user_id = 'YOUR_USER_ID' AND analysis_text = 'Test analysis';
```

## 🔄 Откат миграции (если нужно)

```sql
-- Удаление таблицы и всех зависимостей
DROP TABLE IF EXISTS public.monthly_analytics CASCADE;

-- Удаление функции триггера
DROP FUNCTION IF EXISTS update_monthly_analytics_updated_at() CASCADE;
```

⚠️ **Внимание:** Откат удалит все данные аналитики!

## ❌ Возможные ошибки

### Ошибка: "relation already exists"

```sql
-- Таблица уже существует, проверьте:
SELECT * FROM monthly_analytics LIMIT 1;

-- Если нужно пересоздать:
DROP TABLE IF EXISTS monthly_analytics CASCADE;
-- Затем запустите миграцию заново
```

### Ошибка: RLS policies conflict

```sql
-- Удалите старые политики
DROP POLICY IF EXISTS "Users can read their own monthly analytics" ON monthly_analytics;
DROP POLICY IF EXISTS "Service role can manage monthly analytics" ON monthly_analytics;
DROP POLICY IF EXISTS "Users can insert their own monthly analytics" ON monthly_analytics;
DROP POLICY IF EXISTS "Admins can read all monthly analytics" ON monthly_analytics;

-- Затем запустите миграцию заново
```

### Ошибка: "function already exists"

```sql
-- Удалите функцию
DROP FUNCTION IF EXISTS update_monthly_analytics_updated_at();

-- Затем запустите миграцию заново
```

## 🎯 Следующие шаги

После успешного применения миграции:

1. ✅ Деплой обновленного кода на Vercel
2. ✅ Проверка переменных окружения (PERPLEXITY_API_KEY)
3. ✅ Тестирование API endpoints
4. ✅ Проверка UI календаря
5. ✅ Мониторинг cron job

## 📝 Логирование

Для отслеживания работы системы:

```sql
-- Просмотр всех аналитик
SELECT 
  u.email,
  ma.year,
  ma.month,
  ma.week_number,
  ma.days_analyzed,
  ma.is_final,
  ma.created_at
FROM monthly_analytics ma
JOIN auth.users u ON u.id = ma.user_id
ORDER BY ma.created_at DESC
LIMIT 20;

-- Статистика по месяцам
SELECT 
  year,
  month,
  COUNT(*) as total_analytics,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN is_final THEN 1 ELSE 0 END) as final_analytics
FROM monthly_analytics
GROUP BY year, month
ORDER BY year DESC, month DESC;

-- Проблемные аналитики
SELECT *
FROM monthly_analytics
WHERE status != 'completed'
ORDER BY created_at DESC;
```

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте логи Supabase Dashboard → Database → Logs
2. Проверьте статус миграций в Supabase CLI: `supabase migration list`
3. Проверьте структуру таблицы запросами выше
4. Обратитесь к полной документации в `PERPLEXITY_ANALYTICS_GUIDE.md`

---

**Миграция 024** | Версия 1.0 | Создана: Ноябрь 2024


