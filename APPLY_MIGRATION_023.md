# Применение миграции 023: Добавление политик доступа админа к записям пользователей

## Проблема
Администраторы не могут видеть записи пользователей в админ-панели, потому что не настроены RLS политики для доступа админов к таблице `daily_entries`.

## Решение
Миграция `023_add_admin_daily_entries_policy.sql` добавляет следующие политики:
- Админы могут просматривать все записи всех пользователей
- Админы могут обновлять записи (для модерации)
- Админы могут удалять записи (для модерации)

## Шаги по применению

### 1. Применить миграцию в production на Vercel

```bash
# Перейти в папку проекта
cd /Users/d.chistoforov/Desktop/MoodFlow

# Применить миграцию через Supabase CLI
npx supabase db push --db-url "YOUR_DATABASE_URL"
```

**ИЛИ** применить через Supabase Dashboard:

1. Открыть [Supabase Dashboard](https://app.supabase.com)
2. Выбрать проект
3. Перейти в **SQL Editor**
4. Скопировать содержимое файла `supabase/migrations/023_add_admin_daily_entries_policy.sql`
5. Вставить в SQL Editor
6. Нажать **Run**

### 2. Проверить применение миграции

Запустить следующий SQL запрос в SQL Editor:

```sql
-- Проверить, что политики созданы
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'daily_entries'
ORDER BY policyname;
```

Должны появиться следующие политики:
- ✅ `Admins can view all entries` (SELECT)
- ✅ `Admins can update all entries` (UPDATE)
- ✅ `Admins can delete all entries` (DELETE)
- ✅ `Psychologists can view subscribed users entries` (SELECT)
- ✅ `Users can view own entries` (SELECT)
- ✅ `Users can insert own entries` (INSERT)
- ✅ `Users can update own entries` (UPDATE)
- ✅ `Users can delete own entries` (DELETE)

### 3. Проверить работу в админ-панели

1. Зайти в админ-панель: `https://your-app.vercel.app/admin`
2. Перейти в раздел **Пользователи**
3. Кликнуть на пользователя (например, d.chistoforov@health-samurai.io)
4. Проверить, что отображаются все записи пользователя

### 4. Тест-запрос для проверки доступа админа

Выполнить в SQL Editor от имени админа:

```sql
-- Проверить, что админ может видеть записи всех пользователей
SELECT 
  de.id,
  de.entry_date,
  de.mood_score,
  u.email as user_email,
  u.full_name as user_name
FROM daily_entries de
JOIN users u ON u.id = de.user_id
WHERE de.is_deleted = false
ORDER BY de.entry_date DESC
LIMIT 10;
```

## Откат миграции (если нужно)

```sql
-- Удалить политики админа
DROP POLICY IF EXISTS "Admins can view all entries" ON daily_entries;
DROP POLICY IF EXISTS "Admins can update all entries" ON daily_entries;
DROP POLICY IF EXISTS "Admins can delete all entries" ON daily_entries;

-- Вернуть старое имя политики для психологов
DROP POLICY IF EXISTS "Psychologists can view subscribed users entries" ON daily_entries;
CREATE POLICY "Psychologists can view subscribed entries" ON daily_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      JOIN users u ON u.id = daily_entries.user_id
      WHERE p.user_id = auth.uid()::text
      AND u.subscription_tier IN ('subscription', 'personal')
      AND p.active = true
    )
  );
```

## Примечания

- После применения миграции перезапуск приложения не требуется
- Политики RLS применяются мгновенно
- Эта миграция не изменяет данные, только права доступа
- Безопасно применять в production

