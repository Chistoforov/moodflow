# Исправление ошибки при сохранении материалов админом

## Проблема

При попытке создать новый материал в админ-панели возникала ошибка "Failed to save post".

## Причина

Была обнаружена несоответствие между типами данных:
1. В таблице `psychologists` поле `user_id` ссылается на `users.sso_uid` (TEXT)
2. Код проверки админа искал психолога по `session.user.id` (UUID) вместо `users.sso_uid`
3. Миграция 019 также неправильно заполняла поле `user_id` используя UUID вместо TEXT

## Что было исправлено

### 1. API эндпоинты
Обновлены следующие файлы:
- `/src/app/api/admin/posts/route.ts` - создание и получение постов
- `/src/app/api/admin/posts/[postId]/route.ts` - редактирование и удаление постов
- `/src/app/api/admin/users/route.ts` - получение пользователей

Теперь функция `checkAdminRole`:
1. Сначала получает `sso_uid` из таблицы `users` по `session.user.id`
2. Затем ищет психолога по `user_id = sso_uid`
3. Добавлено детальное логирование для диагностики проблем

### 2. Фронтенд
Обновлен `/src/app/admin/materials/page.tsx`:
- Улучшена обработка ошибок
- Добавлено логирование ответов от сервера
- Более информативные сообщения об ошибках

### 3. База данных
Создана новая миграция `020_fix_admin_user_id.sql`:
- Исправляет существующие записи в таблице `psychologists`
- Обновляет триггер `handle_admin_user()` для корректного заполнения `user_id`
- Убеждается, что запись админа существует с правильным `user_id`

## Как применить исправление

### Шаг 1: Применить миграцию базы данных

Если используете Supabase локально:
```bash
supabase db push
```

Если используете Supabase Cloud:
1. Зайдите в Supabase Dashboard
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла `supabase/migrations/020_fix_admin_user_id.sql`
4. Выполните SQL запрос

### Шаг 2: Проверка

После применения миграции проверьте в SQL Editor:

```sql
-- Проверить запись админа
SELECT * FROM psychologists WHERE email = 'site4people@gmail.com';

-- Убедиться, что user_id соответствует sso_uid
SELECT 
  p.id,
  p.email,
  p.user_id,
  u.sso_uid,
  p.role,
  p.active
FROM psychologists p
LEFT JOIN users u ON p.user_id = u.sso_uid
WHERE p.email = 'site4people@gmail.com';
```

Должны увидеть:
- Запись психолога существует
- `user_id` совпадает с `u.sso_uid`
- `role = 'admin'`
- `active = true`

### Шаг 3: Тестирование

1. Войдите в админ-панель как `site4people@gmail.com`
2. Перейдите в раздел "Материалы"
3. Нажмите кнопку "+" для создания нового материала
4. Заполните заголовок и текст
5. Нажмите "Сохранение"

Материал должен успешно сохраниться без ошибок.

### Шаг 4: Проверка логов (если проблема сохраняется)

Откройте консоль разработчика в браузере и проверьте:
1. Network вкладку - какой статус возвращает `/api/admin/posts`
2. Console - какие ошибки логируются
3. В Vercel/Supabase логах проверьте серверные ошибки

## Дополнительно

Если проблема все еще возникает, проверьте:

1. **Пользователь существует в таблице users**:
```sql
SELECT * FROM users WHERE email = 'site4people@gmail.com';
```

2. **Триггер auto_create_user работает** (из миграции 002):
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

3. **Проверьте RLS политики** (если включены):
```sql
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

## Технические детали

### Структура таблиц

```sql
-- users table
users (
  id UUID PRIMARY KEY,
  sso_uid TEXT UNIQUE,  -- используется для связи с psychologists
  email TEXT,
  ...
)

-- psychologists table
psychologists (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(sso_uid),  -- ссылка на sso_uid, не на id!
  email TEXT,
  role TEXT,  -- 'admin' или 'psychologist'
  active BOOLEAN,
  ...
)

-- posts table
posts (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT,
  author_id UUID REFERENCES psychologists(id),  -- ссылка на id психолога
  ...
)
```

### Последовательность создания пользователя-админа

1. Пользователь входит через Google SSO → создается запись в `auth.users`
2. Триггер `on_auth_user_created` (миграция 002) → создает запись в `users` с `sso_uid = auth.users.id`
3. Триггер `on_auth_user_created_admin` (миграция 019, исправлен в 020) → если email = 'site4people@gmail.com', создает запись в `psychologists` с `user_id = users.sso_uid`
4. Теперь API может найти психолога: `session.user.id` → `users.id` → `users.sso_uid` → `psychologists.user_id`

