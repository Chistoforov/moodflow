# 🔧 Проверка настроек Vercel

## Проблема
Код не обновляется на production даже после принудительного деплоя.

## ✅ ЧТО ПРОВЕРИТЬ В VERCEL:

### 1️⃣ Откройте настройки проекта
https://vercel.com/dashboard

1. Найдите проект MoodFlow (или v0-mood)
2. Нажмите на проект
3. Перейдите в **Settings**

### 2️⃣ Проверьте Git Settings
**Settings → Git**

Убедитесь:
- ✅ **Production Branch:** `main` (не master!)
- ✅ **Connected Git Repository:** правильный репозиторий

### 3️⃣ Проверьте Root Directory
**Settings → General → Root Directory**

Должно быть:
- ✅ **Root Directory:** `.` (точка) или пусто
- ❌ НЕ должно быть `/src` или другой директории

### 4️⃣ Проверьте Build & Development Settings
**Settings → General → Build & Development Settings**

Должно быть:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (или оставьте пусто для автоопределения)
- **Output Directory:** `.next` (или пусто)
- **Install Command:** `npm install` (или пусто)

### 5️⃣ Проверьте последний деплой
**Deployments (главная страница проекта)**

Найдите последний деплой и проверьте:
- ✅ Status: Ready
- ✅ Source: main branch
- ✅ Commit: `94d81fe` "Force rebuild: Clear cache..."

Нажмите на него и проверьте:
- **Build Logs** - нет ли ошибок?
- **Source** - правильный ли коммит?

---

## 🚨 ЕСЛИ ВСЕ НАСТРОЙКИ ПРАВИЛЬНЫЕ:

Попробуйте **удалить и пересоздать деплой**:

1. В Vercel Dashboard → ваш проект
2. Settings → General → **Delete Project** (в самом низу)
3. Подтвердите удаление
4. Импортируйте проект заново с GitHub

Это радикально, но иногда помогает при проблемах с кэшем Vercel.

---

## 🔍 ИЛИ попробуйте деплой на другой платформе:

Если Vercel не работает, можем быстро задеплоить на:
- Netlify
- Railway
- Render

Покажите мне что в настройках Git и Root Directory!

