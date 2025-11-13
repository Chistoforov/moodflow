# Применение миграции 022 - Admin Users Policy

## Проблема
1. Админ не видит других пользователей в списке, только себя
2. Роль "admin" не отображается правильно (показывает "бесплатный")

## Решение
Миграция `022_add_admin_users_policy.sql` добавляет RLS политики, которые позволяют админам видеть всех пользователей.

## Как применить

### Вариант 1: Через Supabase Dashboard (рекомендуется)

1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите проект MoodFlow
3. Перейдите в SQL Editor
4. Скопируйте и выполните содержимое файла `supabase/migrations/022_add_admin_users_policy.sql`

### Вариант 2: Через Supabase CLI

```bash
npx supabase db push
```

или

```bash
npx supabase migration up
```

## Проверка

После применения миграции:

1. Обновите страницу админ-панели
2. Перейдите в раздел "Пользователи"
3. Теперь вы должны видеть всех пользователей
4. Ваша роль должна отображаться как "Админ"

## Что изменилось в коде

### Backend (API)
- `/src/app/api/admin/users/route.ts` - теперь возвращает `effective_role`, который учитывает роль из таблицы `psychologists`

### Frontend
- `/src/app/admin/users/page.tsx` - использует `effective_role` для отображения роли, включая "Админ"

### База данных
- Добавлены RLS политики для админов:
  - `"Admins can view all users"` - админы могут видеть всех пользователей
  - `"Admins can update all users"` - админы могут обновлять всех пользователей

