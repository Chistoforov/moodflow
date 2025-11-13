# 🚀 ДЕПЛОЙ ИСПРАВЛЕНИЯ РОЛИ АДМИНА

## ✅ ЧТО УЖЕ СДЕЛАНО:

1. ✅ Код API исправлен (`src/app/api/admin/users/route.ts`)
2. ✅ Frontend исправлен (`src/app/admin/users/page.tsx`)
3. ✅ Миграция создана (`supabase/migrations/022_add_admin_users_policy.sql`)
4. ✅ Изменения закоммичены в git

## 📋 ЧТО НУЖНО СДЕЛАТЬ:

### Шаг 1: Выполните SQL в Supabase (ОБЯЗАТЕЛЬНО!)

Откройте **Supabase Dashboard → SQL Editor** и выполните этот скрипт:

```sql
-- Создаем/обновляем запись админа
INSERT INTO psychologists (user_id, email, full_name, role, active)
SELECT 
  u.sso_uid,
  'site4people@gmail.com',
  COALESCE(u.full_name, 'Admin'),
  'admin',
  true
FROM users u
WHERE u.email = 'site4people@gmail.com'
ON CONFLICT (email) DO UPDATE
SET 
  user_id = EXCLUDED.user_id,
  role = 'admin',
  active = true,
  updated_at = NOW();

-- Добавляем RLS политики
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admins can view all users'
  ) THEN
    CREATE POLICY "Admins can view all users" ON users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM psychologists p
          WHERE p.user_id = auth.uid()::text
          AND p.role = 'admin'
          AND p.active = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admins can update all users'
  ) THEN
    CREATE POLICY "Admins can update all users" ON users
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM psychologists p
          WHERE p.user_id = auth.uid()::text
          AND p.role = 'admin'
          AND p.active = true
        )
      );
  END IF;
END $$;

-- Проверка результата
SELECT 
  u.email,
  u.subscription_tier,
  p.role as psychologist_role,
  p.active
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'site4people@gmail.com';
```

**Ожидаемый результат последнего SELECT:**
- `psychologist_role`: `admin` ✅
- `active`: `true` ✅

---

### Шаг 2: Запушьте изменения в Git

Откройте **терминал** и выполните:

```bash
cd /Users/d.chistoforov/Desktop/MoodFlow
git push
```

Если работаете на **Vercel**, это автоматически запустит деплой (2-3 минуты).

---

### Шаг 3: Дождитесь деплоя на Vercel

1. Откройте https://vercel.com/dashboard
2. Найдите проект MoodFlow
3. Дождитесь статуса **"Ready"** (зеленая галочка)

---

### Шаг 4: Проверьте результат

1. Откройте ваше приложение
2. **Полностью перезагрузите страницу** (Cmd+Shift+R или Ctrl+Shift+F5)
3. Перейдите в **Пользователи**

**Ожидаемый результат:**

```
Пользователи
Всего пользователей: 3

Email                          | Имя                | Роль    | Дата регистрации
-------------------------------|--------------------|---------|-----------------
dashalala02@gmail.com          | Dubrovskaia Daria  | [роль]  | 3 ноября 2025 г.
site4people@gmail.com          | Daniil Chistoforov | Админ ✅ | 3 ноября 2025 г.
d.chistoforov@health-samurai.io| Daniil Chistoforov | [роль]  | 3 ноября 2025 г.
```

---

## 🔍 Если не работает после деплоя

### Проверьте API ответ:

1. Откройте DevTools (F12)
2. Network → обновите страницу
3. Найдите запрос `/api/admin/users`
4. Посмотрите Response

**Должно быть:**
```json
{
  "users": [
    {
      "email": "site4people@gmail.com",
      "effective_role": "admin"  ← ПРОВЕРЬТЕ ЭТО!
    }
  ]
}
```

Если `effective_role` = `"free"` → значит SQL скрипт из Шага 1 не был выполнен.

---

## 💡 Важно

- **SQL скрипт** нужно выполнить ОБЯЗАТЕЛЬНО - без него роль не появится
- **git push** нужен для деплоя нового кода API
- **Полная перезагрузка страницы** (Shift+F5) сбросит кэш

---

## ✅ Контрольный список

- [ ] Выполнил SQL скрипт в Supabase
- [ ] Проверил результат SELECT - role='admin', active=true
- [ ] Сделал `git push`
- [ ] Дождался деплоя на Vercel (статус Ready)
- [ ] Перезагрузил страницу с очисткой кэша (Shift+F5)
- [ ] Вижу роль "Админ" у site4people@gmail.com ✅

