# Настройка Google SSO для MoodFlow

## Что сделано

✅ Страница логина переделана на Google OAuth
✅ Убран magic link (email OTP)
✅ Callback routes готовы для работы с OAuth

## Настройка Google OAuth в Supabase

### 1. Создайте Google OAuth приложение

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Выберите **Web application**
6. Настройте:
   - **Name**: MoodFlow Production (или любое имя)
   - **Authorized JavaScript origins**:
     - `https://moodflow-six.vercel.app`
     - `http://localhost:3000` (для локальной разработки)
   - **Authorized redirect URIs**:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - Найдите YOUR-PROJECT-REF в настройках Supabase

7. Сохраните **Client ID** и **Client Secret**

### 2. Настройте Google провайдера в Supabase

1. Откройте [Supabase Dashboard](https://app.supabase.com/)
2. Выберите ваш проект
3. Перейдите в **Authentication** → **Providers**
4. Найдите **Google** и включите его
5. Вставьте:
   - **Client ID** (из Google Console)
   - **Client Secret** (из Google Console)
6. Убедитесь, что **Redirect URL** правильный:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Нажмите **Save**

### 3. Настройте Site URL в Supabase

1. В Supabase перейдите в **Authentication** → **URL Configuration**
2. Установите:
   - **Site URL**: `https://moodflow-six.vercel.app`
   - **Redirect URLs**: Добавьте:
     - `https://moodflow-six.vercel.app/api/auth/callback`
     - `http://localhost:3000/api/auth/callback` (для разработки)

### 4. (Опционально) Отключите Email провайдер

Если хотите полностью убрать возможность входа через email:

1. В Supabase перейдите в **Authentication** → **Providers**
2. Найдите **Email** и отключите его

### 5. Локальная разработка

Для локальной разработки:

1. Убедитесь, что в `.env.local` есть:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. В Google Cloud Console добавьте в **Authorized redirect URIs**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```

3. В Supabase добавьте в **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/callback
   ```

## Проверка работы

1. Откройте `https://moodflow-six.vercel.app`
2. Должна открыться страница с кнопкой "Войти через Google"
3. Нажмите на кнопку
4. Пройдите авторизацию Google
5. Вас должно перенаправить на `/calendar`

## Устранение проблем

### Ошибка "redirect_uri_mismatch"

**Причина**: URL callback в Google Console не совпадает с URL в Supabase

**Решение**: 
1. Проверьте, что в Google Console в **Authorized redirect URIs** точно указан:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
2. YOUR-PROJECT-REF можно найти в Settings → API вашего Supabase проекта

### Ошибка "auth_callback_error"

**Причина**: Проблема при обмене кода на сессию

**Решение**:
1. Проверьте, что Client ID и Client Secret правильно введены в Supabase
2. Убедитесь, что Google OAuth включен в Supabase
3. Проверьте логи в Supabase Dashboard

### Бесконечное перенаправление

**Причина**: Неправильная настройка Redirect URLs

**Решение**:
1. В Supabase проверьте **Site URL** - должен быть `https://moodflow-six.vercel.app`
2. В **Redirect URLs** должен быть `https://moodflow-six.vercel.app/api/auth/callback`

## Изменения в коде

### `/src/app/(auth)/login/page.tsx`
- ✅ Убрано поле email
- ✅ Убрана функция `signInWithOtp`
- ✅ Добавлена функция `signInWithOAuth` с провайдером Google
- ✅ Добавлена красивая кнопка Google с иконкой

### Callback routes (без изменений)
- `/src/app/api/auth/callback/route.ts` - работает с OAuth
- `/src/app/(auth)/callback/page.tsx` - работает с OAuth

## Дополнительные возможности

### Добавить другие провайдеры

Можно легко добавить другие OAuth провайдеры:
- GitHub
- GitLab
- Bitbucket
- Azure
- Facebook
- Twitter

Просто добавьте новую кнопку в `login/page.tsx`:
```typescript
const handleGitHubLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
}
```

### Получить данные пользователя Google

После авторизации можно получить данные:
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log(user?.user_metadata) // имя, email, аватар из Google
```

## Следующие шаги

1. ✅ Настройте Google OAuth в Google Console
2. ✅ Настройте Google провайдера в Supabase
3. ✅ Обновите Redirect URLs
4. ✅ Протестируйте вход
5. (Опционально) Отключите Email провайдер если не нужен

После настройки magic link больше не будет работать, только Google SSO.



