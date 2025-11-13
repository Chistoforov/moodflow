-- Простая проверка статуса админа
-- Выполните этот запрос, чтобы увидеть что в базе данных

SELECT 
  u.email,
  u.sso_uid,
  u.subscription_tier as "Подписка в users",
  p.role as "Роль в psychologists",
  p.active as "Активен",
  p.user_id as "user_id в psychologists (должен = sso_uid)"
FROM users u
LEFT JOIN psychologists p ON p.user_id = u.sso_uid
WHERE u.email = 'site4people@gmail.com';

