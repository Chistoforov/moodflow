# Отладка проблемы с аналитикой в админ-панели

## Проблема
В админке у пользователя поле рекомендаций и аналитики пустое, хотя в календаре пользователя эти данные есть.

## Причина
Обнаружена несоответствие в использовании ID:
- В таблице `monthly_analytics.user_id` хранится UUID из `auth.users.id` (совпадает с `users.sso_uid`)
- В таблице `daily_entries.user_id` хранится UUID из `users.id` (внутренний ID)
- В админ-панели использовался `user.id` (внутренний ID) для построения URL

## Внесенные изменения

### 1. Исправлен URL в списке пользователей
**Файл:** `src/app/admin/users/page.tsx`

Изменено с:
```tsx
<Link href={`/admin/users/${user.id}`}>
```

На:
```tsx
<Link href={`/admin/users/${user.sso_uid}`}>
```

### 2. Исправлен API для получения записей пользователя
**Файл:** `src/app/api/admin/users/[userId]/entries/route.ts`

Теперь `userId` в URL интерпретируется как `sso_uid`:
- Ищем пользователя по `sso_uid`
- Получаем внутренний `id`
- Используем внутренний `id` для поиска в `daily_entries`

### 3. API аналитики уже работает правильно
**Файл:** `src/app/api/admin/users/[userId]/analytics/route.ts`

Использует `userId` напрямую для поиска в `monthly_analytics`, что правильно, так как:
- `userId` = `sso_uid`
- `monthly_analytics.user_id` = `auth.users.id` = `sso_uid`

## Структура базы данных

```
auth.users.id (UUID) ←─┐
                       │
users.sso_uid (TEXT) ──┴─→ Одно и то же значение
users.id (UUID) ────────→ Внутренний ID (другое значение!)

monthly_analytics.user_id → auth.users.id (= sso_uid)
daily_entries.user_id → users.id (внутренний ID)
psychologists.user_id → users.sso_uid (TEXT)
```

## Проверка RLS политик

Необходимо убедиться, что миграция `026_fix_monthly_analytics_admin_policies.sql` была применена в production.

Политика должна позволять админам читать все аналитики:

```sql
CREATE POLICY "Admins can read all monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );
```

## Как проверить

1. Убедитесь, что миграции применены в production
2. Перезагрузите приложение
3. Войдите как админ
4. Откройте страницу любого пользователя с существующей аналитикой
5. Проверьте, что данные отображаются

## SQL для проверки в production

Выполните в Supabase SQL Editor:

```sql
-- Проверить существующие политики
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'monthly_analytics' 
AND schemaname = 'public';

-- Проверить данные аналитики
SELECT 
    ma.id,
    ma.user_id,
    u.email,
    ma.year,
    ma.month,
    ma.week_number,
    LENGTH(ma.general_impression) as impression_len,
    LENGTH(ma.recommendations) as recommendations_len
FROM monthly_analytics ma
LEFT JOIN users u ON u.sso_uid = ma.user_id::text
ORDER BY ma.created_at DESC
LIMIT 10;
```
