-- Простая версия: создание только bucket
-- Политики нужно добавить через UI (см. инструкцию ниже)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-entries',
  'audio-entries',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a']
)
ON CONFLICT (id) DO NOTHING;

