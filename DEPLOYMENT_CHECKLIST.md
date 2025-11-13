# ✅ Чек-лист для деплоя Месячной Аналитики

## Перед деплоем

### 1. База данных ⏱️ 5 минут

- [ ] Открыт Supabase Dashboard
- [ ] Перешел в SQL Editor
- [ ] Скопировал содержимое `supabase/migrations/024_create_monthly_analytics.sql`
- [ ] Выполнил SQL (нажал Run)
- [ ] Проверил создание таблицы:
  ```sql
  SELECT COUNT(*) FROM monthly_analytics;
  ```
  Должно вернуть 0 (таблица пуста, но существует)

### 2. Переменные окружения ⏱️ 3 минуты

#### Локально (.env.local)
- [ ] Есть `PERPLEXITY_API_KEY=pplx-...`
- [ ] Есть `CRON_SECRET=...` (любая строка)
- [ ] Файл `.env.local` в `.gitignore`

#### Vercel Dashboard
- [ ] Открыл Settings → Environment Variables
- [ ] Добавил `PERPLEXITY_API_KEY` (Production, Preview, Development)
- [ ] Добавил `CRON_SECRET` (Production, Preview, Development)
- [ ] Сохранил изменения

### 3. Проверка кода ⏱️ 2 минуты

- [ ] Нет ошибок линтера
  ```bash
  npm run lint
  ```
- [ ] Проект собирается локально
  ```bash
  npm run build
  ```
- [ ] Нет TypeScript ошибок

## Деплой

### 4. Git и Vercel ⏱️ 5 минут

- [ ] Все файлы добавлены в git
  ```bash
  git add .
  git status  # Проверить список файлов
  ```

- [ ] Создан коммит
  ```bash
  git commit -m "feat: add monthly analytics with Perplexity AI"
  ```

- [ ] Запушен в main
  ```bash
  git push origin main
  ```

- [ ] Vercel начал деплой (проверить в Dashboard)

- [ ] Деплой завершен успешно ✅

### 5. Проверка деплоя ⏱️ 3 минуты

- [ ] Сайт открывается
- [ ] Страница календаря загружается
- [ ] В Vercel → Functions видны новые endpoints:
  - `/api/analytics`
  - `/api/analytics/generate`
  - `/api/cron/monthly-analytics`

- [ ] В Vercel → Cron Jobs виден новый cron:
  - `monthly-analytics` с расписанием `0 22 * * *`

## После деплоя

### 6. Тестирование ⏱️ 10 минут

#### Создание тестовых данных
- [ ] Залогинился в приложение
- [ ] Создал минимум 3 записи в дневнике
- [ ] Перешел на страницу Календарь

#### Ручная генерация
- [ ] Видна кнопка "Сгенерировать"
- [ ] Нажал "Сгенерировать"
- [ ] Показывается индикатор загрузки
- [ ] Через 10-30 секунд появилась аналитика
- [ ] Все 5 секций отображаются корректно:
  - [ ] Общее впечатление
  - [ ] ✨ Положительные тенденции
  - [ ] 🔍 Возможные причины спада
  - [ ] 💡 Рекомендации и техники
  - [ ] 🎯 Направление для размышлений

#### Проверка в БД
- [ ] Открыл Supabase Dashboard → Table Editor
- [ ] Выбрал таблицу `monthly_analytics`
- [ ] Видна созданная запись с корректными данными

### 7. Мониторинг ⏱️ 5 минут

#### Vercel Logs
- [ ] Открыл Vercel Dashboard → Logs
- [ ] Видны успешные запросы к `/api/analytics/generate`
- [ ] Нет ошибок 500

#### Cron Job (необязательно сейчас)
- [ ] Vercel → Cron Jobs → Logs
- [ ] Ожидание первого запуска (следующий день в 22:00 UTC)

### 8. Финальная проверка ⏱️ 5 минут

- [ ] Переключение между месяцами работает
- [ ] Аналитика загружается для текущего месяца
- [ ] При отсутствии аналитики показывается плейсхолдер
- [ ] Мобильная версия отображается корректно
- [ ] Нет ошибок в консоли браузера

## Дополнительные проверки (опционально)

### Проверка cron job вручную

```bash
# Получить URL вашего деплоя
DEPLOYMENT_URL="https://your-app.vercel.app"
CRON_SECRET="your-secret"

# Запустить cron job вручную
curl -X GET "${DEPLOYMENT_URL}/api/cron/monthly-analytics" \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Проверить ответ (должен быть JSON с results)
```

### Проверка API endpoints

```bash
# Получить аналитику (нужен auth token)
curl -X GET "${DEPLOYMENT_URL}/api/analytics?year=2024&month=11" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"

# Генерация аналитики (нужен auth token)
curl -X POST "${DEPLOYMENT_URL}/api/analytics/generate" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 11}'
```

## Troubleshooting

### Миграция не применилась
- [ ] Проверить логи в Supabase Dashboard
- [ ] Повторно выполнить SQL из миграции
- [ ] См. `APPLY_MIGRATION_024.md`

### Переменные окружения не работают
- [ ] Проверить Vercel → Settings → Environment Variables
- [ ] Пересобрать деплой (Vercel → Deployments → Redeploy)
- [ ] Проверить имена переменных (без опечаток)

### Аналитика не генерируется
- [ ] Проверить PERPLEXITY_API_KEY
- [ ] Проверить баланс Perplexity аккаунта
- [ ] Проверить логи в Vercel Functions
- [ ] Убедиться, что есть минимум 3 записи

### Cron не запускается
- [ ] Проверить Vercel → Cron Jobs
- [ ] Проверить `vercel.json` (должен быть закоммичен)
- [ ] Дождаться следующего запуска (22:00 UTC)

### Ошибки RLS
- [ ] Проверить, что миграция применена
- [ ] Проверить auth.uid() в Supabase
- [ ] Для админов проверить запись в psychologists

## Готово! 🎉

Если все пункты отмечены ✅, система работает корректно.

## Что дальше?

1. **Мониторинг первой недели**
   - Проверяйте логи ежедневно
   - Следите за cron job в 22:00 UTC
   - Собирайте фидбек от пользователей

2. **Статистика**
   ```sql
   -- Ежедневная проверка
   SELECT COUNT(*), COUNT(DISTINCT user_id)
   FROM monthly_analytics
   WHERE created_at > NOW() - INTERVAL '1 day';
   ```

3. **Оптимизация** (если нужно)
   - Настроить алерты для ошибок
   - Добавить метрики в аналитику
   - Оптимизировать промпт Perplexity

## Документация

Для дальнейшей работы:
- 📖 `START_HERE_RU.md` - обзор системы
- 📖 `MONTHLY_ANALYTICS_SETUP_RU.md` - настройка и использование
- 📖 `PERPLEXITY_ANALYTICS_GUIDE.md` - техническая документация
- 📖 `APPLY_MIGRATION_024.md` - работа с БД

---

**Статус:** □ Не начат | ⏳ В процессе | ✅ Завершен

**Общий прогресс:** ___ / 30 пунктов

**Время выполнения:** ~45 минут

**Последнее обновление:** Ноябрь 2024



