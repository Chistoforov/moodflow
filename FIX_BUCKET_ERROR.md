# 🔧 Исправление ошибки "Bucket not found"

## Проблема

При попытке загрузить аудиозапись появляется ошибка **"Bucket not found"**. Это означает, что в Supabase Storage не создан bucket `audio-entries`.

## Решение

### ⚠️ Если получили ошибку "must be owner of table objects"

Если при выполнении SQL получили ошибку прав доступа, используйте **Вариант 2** (через UI) - это самый простой способ.

### Вариант 1: Через SQL Editor (только создание bucket)

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Откройте файл `create-bucket-simple.sql` и скопируйте SQL-код
5. Вставьте в SQL Editor и нажмите **Run** (или `Cmd/Ctrl + Enter`)

Это создаст только bucket. Политики нужно добавить через UI (см. ниже).

### Вариант 2: Через Storage UI (РЕКОМЕНДУЕТСЯ) ⭐

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Storage**
4. Нажмите **New bucket**
5. Заполните:
   - **Name**: `audio-entries`
   - **Public bucket**: ✅ включено (важно!)
   - **File size limit**: `52428800` (50 MB)
   - **Allowed MIME types**: `audio/webm, audio/mp4, audio/mpeg, audio/wav, audio/ogg, audio/x-m4a`
6. Нажмите **Create bucket**

✅ **Готово!** Если bucket публичный, политики создаются автоматически. Попробуйте загрузить аудио - должно работать!

### Вариант 3: Добавление политик (если bucket не публичный)

Если создали bucket как приватный или нужно настроить политики вручную:

1. Supabase Dashboard → **Storage** → выберите bucket `audio-entries`
2. Перейдите на вкладку **Policies**
3. Нажмите **New Policy** для каждой из следующих политик:

**Политика 1: Upload (INSERT)**
- Policy name: `Users can upload own audio files`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: оставьте пустым
- WITH CHECK expression:
```sql
bucket_id = 'audio-entries' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Политика 2: Read (SELECT)**
- Policy name: `Users can read own audio files`
- Allowed operation: `SELECT`
- Target roles: `authenticated`
- USING expression:
```sql
bucket_id = 'audio-entries' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Политика 3: Public Read (SELECT)**
- Policy name: `Public can read audio files`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression:
```sql
bucket_id = 'audio-entries'
```

**Политика 4: Delete**
- Policy name: `Users can delete own audio files`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression:
```sql
bucket_id = 'audio-entries' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Политика 5: Update**
- Policy name: `Users can update own audio files`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression:
```sql
bucket_id = 'audio-entries' AND (storage.foldername(name))[1] = auth.uid()::text
```

### Вариант 4: Через Supabase CLI (для локальной разработки)

Если вы используете локальный Supabase:

```bash
cd /Users/d.chistoforov/Desktop/MoodFlow
npx supabase db reset
```

Это применит все миграции, включая создание bucket.

## Проверка

После создания bucket:

1. Обновите страницу приложения
2. Попробуйте записать и отправить аудио
3. Ошибка должна исчезнуть

## Дополнительная проверка

Убедитесь, что bucket создан:

1. Supabase Dashboard → **Storage**
2. Должен быть виден bucket `audio-entries`
3. В разделе **Policies** должно быть 5 политик:
   - Users can upload own audio files
   - Users can read own audio files
   - Public can read audio files
   - Users can delete own audio files
   - Users can update own audio files

## Если проблема сохраняется

1. Проверьте логи в Vercel Dashboard → **Logs**
2. Убедитесь, что переменные окружения `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` настроены правильно
3. Проверьте, что вы используете правильный проект Supabase (не локальный, а production)

