# 🚨 ИСПРАВЛЕНИЕ ОШИБКИ MIDDLEWARE_INVOCATION_FAILED

## Что произошло

Ваш код успешно задеплоился на Vercel, но при открытии сайта возникает ошибка:
```
500: INTERNAL_SERVER_ERROR
Code: MIDDLEWARE_INVOCATION_FAILED
```

**Причина:** На Vercel не установлены переменные окружения для подключения к Supabase и другим сервисам.

## ✅ ЧТО УЖЕ ИСПРАВЛЕНО

Я обновил файл `middleware.ts`:
- Улучшена обработка ошибок для Edge Runtime
- Оптимизирована работа с куками
- Добавлена более устойчивая проверка переменных окружения

## 🎯 РЕШЕНИЕ (выберите один из вариантов)

### Вариант 1: Автоматическая установка (РЕКОМЕНДУЕТСЯ)

Если у вас есть файл `.env.local` с переменными окружения:

```bash
# 1. Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# 2. Авторизуйтесь в Vercel
vercel login

# 3. Свяжите проект
vercel link

# 4. Запустите скрипт автоматической установки
./fix-vercel-env.sh
```

Скрипт автоматически:
- Прочитает все переменные из `.env.local`
- Загрузит их на Vercel (Production, Preview, Development)
- Запустит новый деплой

### Вариант 2: Ручная установка через Web UI

#### Шаг 1: Откройте настройки Vercel

1. Перейдите на https://vercel.com
2. Откройте ваш проект
3. **Settings** → **Environment Variables**

#### Шаг 2: Добавьте ОБЯЗАТЕЛЬНЫЕ переменные

Для КАЖДОЙ переменной выберите **все окружения** (Production, Preview, Development).

##### 🔴 КРИТИЧЕСКИ ВАЖНЫЕ (без них приложение не работает):

**1. NEXT_PUBLIC_SUPABASE_URL**
```
https://ваш-проект.supabase.co
```
Где найти: Supabase → Project Settings → API → Project URL

**2. NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (длинный токен)
```
Где найти: Supabase → Project Settings → API → anon/public key

**3. SUPABASE_SERVICE_ROLE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (длинный токен)
```
Где найти: Supabase → Project Settings → API → service_role key

##### 🟡 ВАЖНЫЕ (для основных функций):

**4. OPENAI_API_KEY**
```
sk-proj-...
```
Где найти: https://platform.openai.com/api-keys

**5. PERPLEXITY_API_KEY**
```
pplx-...
```
Где найти: https://www.perplexity.ai/settings/api

**6. TELEGRAM_BOT_TOKEN**
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz...
```
Где найти: @BotFather в Telegram

**7. CRON_SECRET**
```
любая-случайная-строка-для-безопасности-123
```
Придумайте сами (например: `moodflow-cron-secret-2024`)

##### 🟢 ОПЦИОНАЛЬНЫЕ (если используете):

**8. STRIPE_SECRET_KEY** (если используете платежи)
```
sk_live_... или sk_test_...
```

**9. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
```
pk_live_... или pk_test_...
```

#### Шаг 3: Redeploy

После добавления ВСЕХ переменных:
1. Перейдите в **Deployments**
2. Кликните на последний деплой
3. Нажмите три точки (⋯) → **Redeploy**
4. Дождитесь завершения деплоя (2-3 минуты)

### Вариант 3: Через Vercel CLI (для продвинутых)

```bash
# Добавление переменных по одной
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Введите значение когда попросят

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Введите значение

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# И так далее...

# После добавления всех переменных - редеплой
vercel --prod
```

## 🔍 ПРОВЕРКА ПОСЛЕ ИСПРАВЛЕНИЯ

### 1. Проверьте сайт

Откройте ваш сайт в браузере:
- ✅ Если ошибка исчезла - все работает!
- ❌ Если ошибка осталась - переходите к шагу 2

### 2. Проверьте Runtime Logs

Если ошибка осталась:
1. Vercel → **Deployments** → кликните на последний деплой
2. Перейдите в **Runtime Logs**
3. Обновите ваш сайт несколько раз
4. Ищите в логах:
   - `"Missing Supabase environment variables"` - значит переменные не установлены
   - Другие ошибки - напишите мне, я помогу

### 3. Убедитесь в правильности переменных

Перейдите в Vercel → **Settings** → **Environment Variables**

Проверьте:
- ✅ Все переменные добавлены
- ✅ Для каждой переменной выбраны ВСЕ окружения (Production, Preview, Development)
- ✅ Нет опечаток в именах переменных
- ✅ Значения скопированы полностью (особенно длинные JWT токены)

## 📝 КОНТРОЛЬНЫЙ СПИСОК

- [ ] Supabase URL добавлен
- [ ] Supabase Anon Key добавлен
- [ ] Supabase Service Role Key добавлен
- [ ] OpenAI API Key добавлен
- [ ] Perplexity API Key добавлен
- [ ] Telegram Bot Token добавлен
- [ ] CRON Secret добавлен
- [ ] Все переменные установлены для всех окружений
- [ ] Выполнен Redeploy
- [ ] Сайт открывается без ошибок

## 🆘 ЕСЛИ ВСЕ ЕЩЕ НЕ РАБОТАЕТ

### Вариант 1: Проверьте логи

```bash
vercel logs --follow
```

Обновите сайт и посмотрите, какие ошибки появляются.

### Вариант 2: Проверьте переменные

```bash
vercel env ls
```

Убедитесь, что все переменные установлены.

### Вариант 3: Полная переустановка

1. Удалите все переменные окружения на Vercel
2. Добавьте их заново (используйте копипаст, чтобы избежать опечаток)
3. Сделайте Redeploy

### Вариант 4: Напишите мне

Если ничего не помогло, отправьте мне:
1. Скриншот из **Settings** → **Environment Variables** (замажьте значения!)
2. Логи из **Runtime Logs**
3. Точный текст ошибки

## 💡 ЧАСТЫЕ ПРОБЛЕМЫ

### Ошибка остается после добавления переменных

**Решение:** Обязательно сделайте **Redeploy** после добавления переменных!

### Переменные добавлены, но в логах "Missing Supabase environment variables"

**Решение:** Проверьте, что переменные добавлены для **Production** окружения.

### Ошибка только на Production, локально работает

**Решение:** Убедитесь, что переменные в Vercel точно такие же, как в `.env.local`.

## ✨ ПОСЛЕ УСПЕШНОГО ИСПРАВЛЕНИЯ

После того, как сайт заработает:

1. **Закоммитьте изменения:**
```bash
git add .
git commit -m "fix: улучшен middleware для Edge Runtime"
git push origin main
```

2. **Проверьте основные функции:**
   - Регистрация/Вход
   - Создание записей
   - Работа календаря
   - Админ-панель (если вы админ)

3. **Настройте мониторинг:**
   - Vercel → **Settings** → **Notifications**
   - Включите уведомления об ошибках

## 🎉 ГОТОВО!

Если вы дошли до этого момента и все работает - поздравляю! 🎊

Ваше приложение MoodFlow успешно задеплоено на Vercel!

