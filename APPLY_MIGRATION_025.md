# 🚀 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Миграция 025

## ❗ Проблема
При попытке создания месячной аналитики админом возникает ошибка **PGRST205** - отказ в доступе.

**Причина:** RLS политика `"Users can insert their own monthly analytics"` блокирует админов от создания аналитики для других пользователей, так как проверяет `auth.uid() = user_id`.

## ✅ Решение
Добавить отдельные RLS политики для админов, позволяющие им:
- INSERT аналитики для любого пользователя
- UPDATE существующей аналитики
- DELETE аналитики (для очистки если нужно)

---

## 🔥 Быстрое применение (Выберите один вариант)

### Вариант 1: Supabase Dashboard (Рекомендуется) ⭐

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите проект **MoodFlow**
3. Перейдите в **SQL Editor** (левое меню)
4. Нажмите **New Query**
5. Скопируйте и вставьте содержимое файла:
   ```
   supabase/migrations/025_fix_monthly_analytics_admin_insert.sql
   ```
6. Нажмите **Run** (или `Ctrl/Cmd + Enter`)
7. Убедитесь, что видите зелёную галочку ✅

### Вариант 2: Копировать SQL прямо отсюда

Скопируйте этот SQL и выполните в Supabase SQL Editor:

```sql
-- Fix: Allow admins to insert monthly analytics for any user
-- Problem: The existing INSERT policy only allows users to insert their own analytics
-- Solution: Add a separate policy for admins to insert analytics for any user

-- First, update the existing policy to be more specific
DROP POLICY IF EXISTS "Users can insert their own monthly analytics" ON public.monthly_analytics;

-- Recreate the user policy with a clear name
CREATE POLICY "Users can insert their own monthly analytics"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add new policy for admins to insert analytics for any user
CREATE POLICY "Admins can insert monthly analytics for any user"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );

-- Also add policy for admins to update analytics
CREATE POLICY "Admins can update monthly analytics"
  ON public.monthly_analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );

-- Add policy for admins to delete analytics (for cleanup if needed)
CREATE POLICY "Admins can delete monthly analytics"
  ON public.monthly_analytics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );
```

---

## ✅ Проверка успешности

После применения выполните в SQL Editor:

```sql
-- Проверка всех RLS политик для monthly_analytics
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'monthly_analytics'
ORDER BY policyname;
```

### Ожидаемый результат: Должно быть **7 политик**:

1. ✅ `Admins can delete monthly analytics` - DELETE
2. ✅ `Admins can insert monthly analytics for any user` - INSERT
3. ✅ `Admins can read all monthly analytics` - SELECT
4. ✅ `Admins can update monthly analytics` - UPDATE
5. ✅ `Service role can manage monthly analytics` - ALL
6. ✅ `Users can insert their own monthly analytics` - INSERT
7. ✅ `Users can read their own monthly analytics` - SELECT

---

## 🧪 Тестирование

### Тест 1: Проверка, что миграция применилась

```sql
-- Должно показать 7 политик
SELECT COUNT(*) as policies_count
FROM pg_policies 
WHERE tablename = 'monthly_analytics';
```

### Тест 2: Проверка админской вставки (через API)

После применения миграции:
1. Откройте админ-панель MoodFlow
2. Перейдите на страницу пользователей
3. Попробуйте запустить анализ для любого пользователя
4. **Ошибка PGRST205 должна исчезнуть!** ✨

---

## 📊 Что изменилось

### До:
```
❌ Админ пытается создать аналитику для user_id = "abc123"
❌ auth.uid() = "admin456" (ID админа)
❌ Политика проверяет: auth.uid() = user_id
❌ "admin456" ≠ "abc123" → ОТКАЗ (PGRST205)
```

### После:
```
✅ Админ пытается создать аналитику для user_id = "abc123"
✅ auth.uid() = "admin456" (ID админа)
✅ Новая политика проверяет: есть ли админ в таблице psychologists
✅ Админ найден с role='admin' → ДОСТУП РАЗРЕШЁН
```

---

## 🔄 Откат (если что-то пошло не так)

```sql
-- Удалить новые политики
DROP POLICY IF EXISTS "Admins can insert monthly analytics for any user" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can update monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can delete monthly analytics" ON public.monthly_analytics;

-- Восстановить старую политику
CREATE POLICY "Users can insert their own monthly analytics"
  ON public.monthly_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

⚠️ **Внимание:** После отката админы снова не смогут создавать аналитику для других пользователей.

---

## ❌ Возможные ошибки

### Ошибка: "policy already exists"

```sql
-- Удалите конфликтующие политики
DROP POLICY IF EXISTS "Admins can insert monthly analytics for any user" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can update monthly analytics" ON public.monthly_analytics;
DROP POLICY IF EXISTS "Admins can delete monthly analytics" ON public.monthly_analytics;

-- Затем запустите миграцию заново
```

### Ошибка: "table does not exist"

```
Сначала примените миграцию 024:
См. APPLY_MIGRATION_024.md
```

---

## 🎯 После применения

1. ✅ Миграция применена в Supabase
2. ✅ Проверьте, что 7 политик активны
3. ✅ Перейдите в админ-панель на Vercel
4. ✅ Попробуйте запустить анализ пользователя
5. ✅ Проверьте логи в Vercel Dashboard
6. ✅ Убедитесь, что ошибка PGRST205 исчезла

---

## 📝 Связанные файлы

- **Миграция:** `supabase/migrations/025_fix_monthly_analytics_admin_insert.sql`
- **API endpoint:** `src/app/api/admin/analytics/manual/route.ts`
- **Предыдущая миграция:** `supabase/migrations/024_create_monthly_analytics.sql`

---

## 🆘 Поддержка

Если после применения миграции всё равно видите ошибку:

1. **Проверьте логи Vercel:**
   - https://vercel.com/dashboard → MoodFlow → Logs
   - Ищите новые логи с эмодзи 📊, ✅, ❌

2. **Проверьте политики в Supabase:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'monthly_analytics';
   ```

3. **Проверьте статус админа:**
   ```sql
   SELECT * FROM psychologists 
   WHERE user_id = auth.uid() 
   AND role = 'admin' 
   AND active = true;
   ```

---

**Миграция 025** | Критическое исправление | Ноябрь 2024

