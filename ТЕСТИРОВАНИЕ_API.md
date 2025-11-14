# Тестирование API после деплоя

## ✅ Деплой завершён успешно

**Дата**: 2025-11-13 23:01  
**Deployment ID**: dpl_9sMeuwQa7agBTMFEdKVYN1eiCKxU  
**URL**: https://moodflow-six.vercel.app  
**Статус**: Ready ✅

## Проверка API endpoint

### Шаг 1: Откройте админ панель

```
https://moodflow-six.vercel.app/admin/users
```

### Шаг 2: Войдите в систему

Используйте ваши учётные данные администратора.

### Шаг 3: Запустите анализ для пользователя

1. Найдите пользователя с минимум 3 записями в текущем месяце
2. Нажмите кнопку **"Запустить анализ"** (📊)
3. Подтвердите действие в модальном окне

### Ожидаемый результат

#### ✅ Успех (200)
```
✅ Анализ успешно создан! Проанализировано X дней и Y записей.
```

#### ℹ️ Анализ уже существует (200)
```
ℹ️ Анализ для этого периода уже существует
```

#### ❌ Недостаточно записей (400)
```
❌ Недостаточно записей для анализа (минимум 3, найдено: N)
```

### Шаг 4: Проверьте логи в браузере

Откройте Developer Console (F12) → Network:
- Должен быть запрос: `POST https://moodflow-six.vercel.app/api/admin/analytics/manual`
- Статус должен быть **200** или **400** (не 404!)

## Возможные проблемы

### Проблема 1: Всё ещё 404

**Причина**: Кеш браузера или CDN Vercel

**Решение**:
1. Очистите кеш браузера (Ctrl+Shift+Delete)
2. Откройте страницу в режиме инкогнито
3. Попробуйте через 1-2 минуты (CDN может кешироваться)
4. Hard refresh: Ctrl+Shift+R (Windows) или Cmd+Shift+R (Mac)

### Проблема 2: 401 Unauthorized

**Причина**: Сессия истекла

**Решение**: Перелогиньтесь в приложении

### Проблема 3: 403 Forbidden

**Причина**: Нет прав администратора

**Решение**: Выполните SQL в Supabase Dashboard:
```sql
SELECT u.email, p.role, p.active
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'ваш_email@example.com';

-- Если роль не admin, обновите:
UPDATE psychologists
SET role = 'admin', active = true
WHERE user_id = (SELECT sso_uid FROM users WHERE email = 'ваш_email@example.com');
```

### Проблема 4: 500 Internal Server Error

**Причина**: Ошибка на сервере или проблемы с RLS политиками

**Решение**:
1. Проверьте логи в Vercel Dashboard → Functions → `/api/admin/analytics/manual`
2. Примените миграции для RLS политик (см. `ИСПРАВЛЕНИЕ_ANALYTICS_RLS.md`)

## Проверка через curl (альтернативный метод)

Если не хотите тестировать через UI, можно использовать curl:

```bash
# Замените YOUR_COOKIE на актуальный cookie из браузера
curl -X POST https://moodflow-six.vercel.app/api/admin/analytics/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_COOKIE_HERE" \
  -d '{"userId":"USER_ID_HERE"}' \
  -v
```

Чтобы получить cookie:
1. Откройте https://moodflow-six.vercel.app/admin/users
2. Откройте DevTools (F12) → Application → Cookies
3. Скопируйте все cookies

## Проверка логов на Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/el-grapaduros-projects/v0-mood)
2. Перейдите в **Functions**
3. Найдите `/api/admin/analytics/manual`
4. Проверьте последние вызовы и ошибки

## Что было исправлено

1. ✅ Удалена конфликтующая папка `moodflow/` с дублирующим `vercel.json`
2. ✅ Выполнен редеплой с очисткой build кеша (`--force`)
3. ✅ API endpoint `/api/admin/analytics/manual/route.ts` теперь доступен на production
4. ✅ Build прошёл успешно без ошибок
5. ✅ Все переменные окружения настроены (PERPLEXITY_API_KEY и др.)

## Следующие шаги

Если тестирование прошло успешно:

1. ✅ Закоммитьте удаление папки `moodflow/`:
   ```bash
   git add -A
   git commit -m "fix: remove conflicting moodflow folder"
   git push origin main
   ```

2. ✅ Примените RLS миграции на production (если ещё не сделано):
   - См. `ИСПРАВЛЕНИЕ_ANALYTICS_RLS.md`

3. ✅ Протестируйте на реальных пользователях

---

**Deployment Info**:
- Deployment ID: `dpl_9sMeuwQa7agBTMFEdKVYN1eiCKxU`
- Inspect URL: https://vercel.com/el-grapaduros-projects/v0-mood/9sMeuwQa7agBTMFEdKVYN1eiCKxU
- Build time: ~40 секунд
- Status: ✅ Ready


