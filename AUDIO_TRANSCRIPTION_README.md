# 🎙️ Аудио транскрипция

## Обзор

Новая упрощенная система аудио транскрипции. Аудио записи больше **не хранятся на сервере**, а отправляются напрямую в OpenAI Whisper API для транскрипции. Результат сохраняется как обычное текстовое сообщение.

## Как это работает

1. **Запись аудио**: Пользователь записывает голосовое сообщение через `AudioRecordModal`
2. **Транскрипция**: Аудио blob отправляется в `/api/transcribe-audio`, который:
   - Принимает audio file напрямую (FormData)
   - Отправляет его в OpenAI Whisper API
   - Возвращает текстовую транскрипцию
3. **Сохранение**: Транскрипция сохраняется как обычное текстовое сообщение в `daily_entries.text_entry`
4. **Отображение**: Транскрипция отображается в чате как обычное текстовое сообщение

## Файлы

### API Endpoints
- `src/app/api/transcribe-audio/route.ts` - Основной endpoint для транскрипции

### Компоненты
- `src/components/entry/AudioRecorder.tsx` - Компонент записи аудио
- `src/components/entry/AudioRecordModal.tsx` - Модальное окно записи
- `src/components/entry/ChatMessage.tsx` - Отображение сообщений (только текст)
- `src/components/entry/ChatInput.tsx` - Поле ввода с кнопкой микрофона

### Главная страница
- `src/app/(user)/entry/[date]/page.tsx` - Страница записи дня

## Преимущества

✅ **Простота**: Нет необходимости управлять audio storage bucket  
✅ **Безопасность**: Нет проблем с RLS политиками для audio_entries  
✅ **Экономия**: Не тратим место на хранение аудио файлов  
✅ **Удобство**: Транскрипция отображается как обычный текст  

## Технические детали

### Формат аудио
Поддерживаемые форматы: `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/m4a`

### API транскрипции
- **Provider**: OpenAI Whisper API
- **Model**: `whisper-1`
- **Language**: `ru` (Russian)
- **Timeout**: 5 минут (300 секунд)

### Переменные окружения
Требуется:
- `OPENAI_API_KEY` - API ключ OpenAI для Whisper

## История изменений

**Ноябрь 2025**: Полная переработка системы аудио записей
- Удалена таблица `audio_entries` из использования
- Удален Supabase Storage bucket для аудио
- Удалены endpoints: `/api/upload-audio`, `/api/transcribe`, `/api/audio-entries`
- Удалены компоненты: `AudioEntriesList`, `AudioModal`, `ProcessingStatus`
- Упрощена архитектура: аудио → транскрипция → текстовое сообщение







