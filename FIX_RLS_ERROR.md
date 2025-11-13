# 🔧 Исправление ошибки "new row violates row-level security policy"

## Проблема

При попытке создать или обновить запись в дневнике появляется ошибка **"new row violates row-level security policy"**. Это означает, что политика RLS (Row Level Security) блокирует операцию вставки/обновления.

## Причина

Политика RLS для таблицы `daily_entries` использует подзапрос к таблице `users`, которая также защищена RLS. Это может вызывать проблемы при проверке прав доступа.

## Решение

### Шаг 1: Применить миграцию через SQL Editor

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Откройте файл `supabase/migrations/008_fix_daily_entries_rls.sql`
5. Скопируйте весь SQL-код из файла
6. Вставьте в SQL Editor и нажмите **Run** (или `Cmd/Ctrl + Enter`)

### Шаг 2: Проверка

После применения миграции:

1. Обновите страницу приложения
2. Попробуйте создать новую запись (текст или аудио)
3. Ошибка должна исчезнуть

## Что делает миграция

1. **Удаляет старые политики RLS** для `daily_entries`
2. **Создает функцию безопасности** `check_user_entry_ownership()`, которая:
   - Использует `SECURITY DEFINER` для обхода RLS на таблице `users`
   - Проверяет, что запись принадлежит текущему пользователю
3. **Создает новые политики RLS**, которые используют эту функцию

## Дополнительные исправления

Также исправлен код в `src/app/api/transcribe/route.ts`:
- Теперь правильно преобразует `auth.users.id` в `users.id` при обновлении `daily_entries`
- Это предотвращает ошибки при транскрипции аудио

## Если проблема сохраняется

1. Проверьте логи в Vercel Dashboard → **Logs**
2. Убедитесь, что миграция применена успешно:
   - Supabase Dashboard → **Database** → **Migrations**
   - Должна быть видна миграция `008_fix_daily_entries_rls`
3. Проверьте, что функция создана:
   - Supabase Dashboard → **Database** → **Functions**
   - Должна быть функция `check_user_entry_ownership`
4. Проверьте политики RLS:
   - Supabase Dashboard → **Database** → **Tables** → `daily_entries` → **Policies**
   - Должно быть 4 политики, использующие функцию `check_user_entry_ownership`

## Альтернативный способ (если SQL Editor не работает)

Если у вас нет доступа к SQL Editor или миграция не применяется:

1. Supabase Dashboard → **Database** → **Tables** → `daily_entries`
2. Перейдите на вкладку **Policies**
3. Удалите все существующие политики для `daily_entries`
4. Создайте новую функцию через **Database** → **Functions** → **New Function**:
   ```sql
   CREATE OR REPLACE FUNCTION public.check_user_entry_ownership(entry_user_id UUID)
   RETURNS BOOLEAN
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     RETURN EXISTS (
       SELECT 1 
       FROM public.users 
       WHERE id = entry_user_id 
       AND sso_uid = auth.uid()::text
     );
   END;
   $$;
   ```
5. Создайте политики вручную через UI, используя функцию `check_user_entry_ownership(user_id)`








