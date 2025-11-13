# 🔍 ДИАГНОСТИКА: Почему роль админа не показывается

## Шаг 1: Проверяем базу данных

### 1.1 Откройте Supabase Dashboard SQL Editor
https://supabase.com/dashboard → Ваш проект → SQL Editor

### 1.2 Выполните этот запрос:
```sql
SELECT 
  u.email,
  u.sso_uid,
  u.subscription_tier,
  p.role as psychologist_role,
  p.active,
  p.user_id
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'site4people@gmail.com';
```

### 1.3 Что должно быть в результате:

| email | sso_uid | subscription_tier | psychologist_role | active | user_id |
|-------|---------|-------------------|-------------------|--------|---------|
| site4people@gmail.com | [какой-то ID] | free | **admin** | **true** | [такой же ID] |

### ❌ Если psychologist_role = NULL или не admin:
Выполните скрипт для создания записи админа:

```sql
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
```

После выполнения повторите проверку из п.1.2

---

## Шаг 2: Проверяем RLS политики

### 2.1 Выполните этот запрос:
```sql
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'users'
AND policyname LIKE '%Admin%';
```

### 2.2 Должны быть эти политики:
- `Admins can view all users` (cmd: SELECT)
- `Admins can update all users` (cmd: UPDATE)

### ❌ Если их нет, выполните:
```sql
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM psychologists p
      WHERE p.user_id = auth.uid()::text
      AND p.role = 'admin'
      AND p.active = true
    )
  );
```

---

## Шаг 3: Проверяем код приложения

### 3.1 Где работает приложение?

#### Вариант А: Локально (localhost:3000)

**Нужно перезапустить сервер!**

```bash
# Остановите (нажмите Ctrl+C в терминале где запущен npm run dev)
# Затем запустите заново:
cd /Users/d.chistoforov/Desktop/MoodFlow
npm run dev
```

Или используйте скрипт:
```bash
chmod +x RESTART_APP.sh
./RESTART_APP.sh
```

#### Вариант Б: На Vercel

**Нужно задеплоить изменения!**

```bash
git add .
git commit -m "Fix admin role display"
git push
```

Vercel автоматически задеплоит изменения (2-3 минуты).

---

## Шаг 4: Проверяем API в браузере

### 4.1 Откройте DevTools (F12)
### 4.2 Перейдите на вкладку **Network**
### 4.3 Обновите страницу "Пользователи" (F5)
### 4.4 Найдите запрос `/api/admin/users`
### 4.5 Посмотрите Response

**Должно быть примерно так:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "site4people@gmail.com",
      "subscription_tier": "free",
      "effective_role": "admin",   ← ЭТО ВАЖНО!
      ...
    }
  ]
}
```

### ❌ Если effective_role = "free" или его нет:
- **Локально**: не перезапустили сервер → перезапустите (Шаг 3.1А)
- **На Vercel**: не задеплоили → задеплойте (Шаг 3.1Б)

### ❌ Если ошибка 403 Forbidden:
База данных не настроена правильно → вернитесь к Шагу 1

---

## Шаг 5: Финальная проверка

После выполнения всех шагов:

1. ✅ В базе данных есть запись в `psychologists` с role='admin'
2. ✅ RLS политики созданы
3. ✅ Приложение перезапущено
4. ✅ API возвращает `effective_role: "admin"`

**Обновите страницу админ-панели** (Shift+F5 для полной перезагрузки)

---

## 🆘 Если всё равно не работает

Пришлите мне:

1. **Результат SQL запроса из Шага 1.2**
2. **Результат из Шага 2.1**
3. **Response из Network (Шаг 4.5)**
4. **Где работает приложение** (localhost или Vercel URL)

Я помогу найти проблему!

