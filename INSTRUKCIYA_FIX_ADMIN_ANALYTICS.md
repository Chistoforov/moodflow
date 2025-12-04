# Инструкция по исправлению доступа админа к аналитике

## Проблема
В админ-панели не отображается аналитика пользователей, хотя она существует в базе данных. При попытке создать аналитику возникает ошибка 500.

## Причина
Политики безопасности (RLS policies) для таблицы `monthly_analytics` были настроены неправильно - они не использовали JOIN с таблицей `users`, из-за чего админ не мог получить доступ к данным.

## Решение

### Шаг 1: Откройте Supabase SQL Editor
1. Перейдите в ваш проект Supabase
2. Откройте раздел "SQL Editor" в боковом меню

### Шаг 2: Запустите SQL-скрипт
1. Откройте файл `FIX_ADMIN_ANALYTICS_ACCESS.sql`
2. Скопируйте весь его содержимое
3. Вставьте в SQL Editor
4. Нажмите "Run"

### Шаг 3: Проверьте результаты
В конце выполнения скрипта вы должны увидеть:
- ✓ Policies created successfully (7 политик создано)
- ✓ Admin access granted (доступ админа подтвержден)
- Список последних аналитических записей

### Шаг 4: Проверьте в админ-панели
1. Обновите страницу админ-панели
2. Перейдите на страницу пользователя
3. Теперь вы должны видеть аналитику, если она есть в базе данных
4. Кнопка "Получить рекомендации" должна работать без ошибок

## Что было исправлено

**До:**
```sql
-- Неправильная политика
CREATE POLICY "Admins can read all monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
      AND active = true
    )
  );
```

**После:**
```sql
-- Правильная политика с JOIN
CREATE POLICY "Admins can read all monthly analytics"
  ON public.monthly_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.psychologists p
      JOIN public.users u ON u.sso_uid = p.user_id
      WHERE p.role = 'admin'
        AND p.active = true
        AND u.sso_uid = auth.uid()::text
    )
  );
```

## Проверка
После применения исправления:
- ✅ Админ может видеть аналитику всех пользователей
- ✅ Админ может редактировать аналитику
- ✅ Админ может создавать аналитику для пользователей
- ✅ Обычные пользователи видят только свою аналитику

## Если проблема остается
1. Проверьте, что вы залогинены как админ (email: site4people@gmail.com)
2. Убедитесь, что в таблице `psychologists` есть запись с `role = 'admin'` и `active = true` для вашего пользователя
3. Очистите кэш браузера и обновите страницу
