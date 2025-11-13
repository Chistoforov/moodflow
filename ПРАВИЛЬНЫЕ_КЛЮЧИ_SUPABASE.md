# 🔑 КАК НАЙТИ ПРАВИЛЬНЫЕ КЛЮЧИ SUPABASE

## Пошаговая инструкция

### 1. Откройте Supabase
1. Перейдите на https://supabase.com
2. Войдите в аккаунт
3. Откройте ваш проект MoodFlow

### 2. Перейдите в настройки API
1. В левом меню кликните на **Settings** (⚙️ иконка внизу)
2. Выберите **API**

### 3. Найдите ваши ключи

На странице API вы увидите несколько секций:

#### 📍 Секция "Project URL"
```
Project URL
https://ваш-проект-id.supabase.co
```
**Это значение для:** `NEXT_PUBLIC_SUPABASE_URL`

#### 📍 Секция "Project API keys"

Вы увидите **ДВА РАЗНЫХ** ключа:

##### 1️⃣ anon public (НЕ скрыт по умолчанию)
```
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
**Это значение для:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ Этот ключ виден всем на клиенте, имеет ограниченные права

##### 2️⃣ service_role (СКРЫТ по умолчанию, нужно нажать "Reveal")
```
service_role                                               [Reveal]
```
**Нажмите кнопку "Reveal"**, чтобы увидеть ключ:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
(другой, более длинный токен)
```
**Это значение для:** `SUPABASE_SERVICE_ROLE_KEY`

🔴 **ВАЖНО:** Этот ключ дает ПОЛНЫЙ доступ к БД, держите его в секрете!

## 🔄 Как обновить ключи на Vercel

### Шаг 1: Откройте Vercel
1. https://vercel.com
2. Выберите ваш проект
3. **Settings** → **Environment Variables**

### Шаг 2: Удалите старые неправильные переменные

Найдите и удалите:
- `SUPABASE_SERVICE_ROLE_KEY` (если значение одинаковое с anon)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (если есть сомнения)

Для удаления: наведите на переменную → три точки (⋯) → **Edit** → **Delete**

### Шаг 3: Добавьте правильные ключи

#### 1. Добавьте NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ваш-проект-id.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 2. Добавьте NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc... (скопируйте anon public key из Supabase)
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 3. Добавьте SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc... (скопируйте service_role key из Supabase - ДРУГОЙ ключ!)
Environments: ✅ Production ✅ Preview ✅ Development
```

### Шаг 4: Redeploy
1. **Deployments** → кликните на последний деплой
2. Три точки (⋯) → **Redeploy**
3. Дождитесь завершения

## ✅ Проверка

После redeploy проверьте:
1. Сайт открывается без ошибки 500
2. Можно войти/зарегистрироваться
3. Работает создание записей

## 🔍 Как проверить, что ключи разные

В Vercel → Settings → Environment Variables:

Кликните **Edit** на каждой переменной и сравните:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - начинается с `eyJhbG...`
- `SUPABASE_SERVICE_ROLE_KEY` - начинается с `eyJhbG...` но **ДРУГОЙ** токен

Первые несколько символов могут совпадать, но полные токены ДОЛЖНЫ быть разными!

## 🆘 Про VITE_SUPABASE_ANON_KEY

Этот ключ для проектов на Vite. В Next.js он НЕ нужен, игнорируйте его.

В Next.js используются переменные с префиксом `NEXT_PUBLIC_`.

## 📝 Шпаргалка

| Где найти в Supabase | Имя переменной в Vercel | Доступ |
|---------------------|------------------------|--------|
| Project URL | NEXT_PUBLIC_SUPABASE_URL | публичный |
| anon public | NEXT_PUBLIC_SUPABASE_ANON_KEY | публичный |
| service_role (Reveal) | SUPABASE_SERVICE_ROLE_KEY | секретный |

---

После обновления ключей сайт должен заработать! 🚀

