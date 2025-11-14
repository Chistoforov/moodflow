# ⚠️ КРИТИЧНО: Проверка Service Role Key в Vercel

## Проблема
Код теперь использует `SUPABASE_SERVICE_ROLE_KEY` для админских операций.
Эта переменная **ДОЛЖНА быть установлена** в Vercel!

## ✅ СРОЧНО - Проверьте переменные окружения:

### Шаг 1: Найдите Service Role Key

1. **Откройте Supabase Dashboard**
   - https://supabase.com/dashboard
   - Выберите проект MoodFlow

2. **Перейдите в Settings → API**
   - В левом меню: Settings
   - Вкладка: API

3. **Скопируйте Service Role Key**
   - Найдите раздел "Project API keys"
   - Ключ `service_role` (⚠️ НЕ anon!)
   - Нажмите "Reveal" и скопируйте

### Шаг 2: Добавьте в Vercel

1. **Откройте Vercel Dashboard**
   - https://vercel.com/dashboard
   - Выберите проект MoodFlow

2. **Settings → Environment Variables**
   - В верхнем меню: Settings
   - Вкладка слева: Environment Variables

3. **Добавьте переменную**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (вставьте скопированный service_role key)
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Нажмите "Save"

### Шаг 3: Редеплой

После добавления переменной Vercel автоматически запустит редеплой.

**ИЛИ** запустите вручную:
```bash
cd /Users/d.chistoforov/Desktop/MoodFlow
vercel --prod
```

### Шаг 4: Тестирование

1. Дождитесь завершения деплоя (1-2 минуты)
2. Hard refresh админ-панели: Cmd+Shift+R
3. Попробуйте запустить анализ
4. **Должно заработать!** 🎉

---

## ⚠️ Безопасность

Service Role Key **обходит все RLS политики**!
- ✅ Безопасно использовать ТОЛЬКО на сервере
- ✅ НИКОГДА не используйте в клиентском коде
- ✅ НИКОГДА не коммитьте в Git
- ✅ Используйте только в переменных окружения

В нашем случае это безопасно, так как:
1. Используется только в API route (серверная сторона)
2. Права админа проверяются ДО использования service role
3. Ключ хранится в переменных окружения Vercel

