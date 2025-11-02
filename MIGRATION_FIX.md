# 🔧 Исправление ошибки миграции

## ❌ Проблема
Ошибка: `ERROR: 42883: operator does not exist: uuid = text`

## ✅ Решение
Исправлен тип данных в таблице `psychologists.user_id` с UUID на TEXT.

## 📋 Что нужно сделать:

### 1. Очистите базу данных (если уже запускали миграцию)

В Supabase SQL Editor выполните:

```sql
-- Удалить все созданные таблицы
DROP TABLE IF EXISTS cron_jobs_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS weekly_summaries CASCADE;
DROP TABLE IF EXISTS daily_entries CASCADE;
DROP TABLE IF EXISTS psychologists CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удалить storage bucket (если был создан)
DELETE FROM storage.buckets WHERE id = 'audio-recordings';
```

### 2. Выполните исправленную миграцию

1. Откройте файл `supabase/migrations/001_initial_schema.sql`
2. Скопируйте **весь код** (260 строк)
3. Вставьте в **Supabase SQL Editor**
4. Нажмите **Run** (или `⌘ Cmd + Enter`)

### 3. Проверьте результат

Должны увидеть:
```
Success. No rows returned
```

## 🔍 Что было исправлено:

**Было:**
```sql
CREATE TABLE psychologists (
  ...
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ...
);
```

**Стало:**
```sql
CREATE TABLE psychologists (
  ...
  user_id TEXT REFERENCES users(sso_uid) ON DELETE CASCADE,
  ...
);
```

## 💡 Почему это важно:

- `auth.uid()` в Supabase возвращает TEXT (UUID как строка)
- `users.sso_uid` хранит этот ID как TEXT
- `psychologists.user_id` должен совпадать по типу с `sso_uid`
- Теперь RLS policies будут работать корректно

---

**После успешной миграции можете запускать проект!** 🚀

