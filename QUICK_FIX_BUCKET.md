# ⚡ Быстрое исправление "Bucket not found"

## Проблема
Ошибка "must be owner of table objects" при выполнении SQL означает, что у вас нет прав на создание политик через SQL Editor.

## ✅ Решение (2 минуты)

### Способ 1: Через UI (САМЫЙ ПРОСТОЙ) ⭐

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Storage** (в левом меню)
4. Нажмите **New bucket** (кнопка справа вверху)
5. Заполните форму:
   - **Name**: `audio-entries`
   - **Public bucket**: ✅ **ВКЛЮЧИТЕ** (это важно!)
   - **File size limit**: `52428800` (50 MB)
   - **Allowed MIME types**: `audio/webm, audio/mp4, audio/mpeg, audio/wav, audio/ogg, audio/x-m4a`
6. Нажмите **Create bucket**

**Готово!** Если bucket публичный, политики создаются автоматически. Попробуйте загрузить аудио - должно работать!

---

### Способ 2: Только создание bucket через SQL

Если предпочитаете SQL, выполните только создание bucket (без политик):

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте содержимое файла `create-bucket-simple.sql`
3. Вставьте и нажмите **Run**

Это создаст bucket. Если bucket публичный, политики не нужны. Если приватный - добавьте через UI (Storage → audio-entries → Policies).

---

## Проверка

После создания bucket:
1. Обновите страницу приложения
2. Попробуйте записать и отправить аудио
3. Ошибка должна исчезнуть ✅

---

## Если всё ещё не работает

1. Убедитесь, что bucket называется точно `audio-entries` (без пробелов, с дефисом)
2. Проверьте, что bucket **публичный** (Public bucket = ✅)
3. Проверьте логи в Vercel Dashboard → Logs
4. Убедитесь, что переменные окружения `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` настроены правильно

