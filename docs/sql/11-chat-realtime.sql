-- ============================================================================
-- 11. CHAT REALTIME + NÂNG CẤP CHAT (idempotent - chay lai duoc nhieu lan)
-- DNXem khi da chay: docs/sql/05-... / 08-... / 09-...
-- Cach chay: mo Supabase Dashboard > SQL Editor > paste va chay.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Storage bucket "chat-images" cho anh gui trong tin nhan
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('chat-images', 'chat-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;
CREATE POLICY "Anyone can view chat images"
  ON storage.objects FOR SELECT USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own chat images" ON storage.objects;
CREATE POLICY "Users can update own chat images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own chat images" ON storage.objects;
CREATE POLICY "Users can delete own chat images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- 2. Cho phep chat tu do (khong gan san pham)
-- ----------------------------------------------------------------------------
ALTER TABLE chat_threads ALTER COLUMN product_id DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. Chat message luu anh (image_url)
-- ----------------------------------------------------------------------------
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ----------------------------------------------------------------------------
-- 4. Notification luu link (thread_id) de mo dung hoi thoai
-- ----------------------------------------------------------------------------
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- ----------------------------------------------------------------------------
-- 5. Realtime publication cho chat_threads + chat_messages
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_threads;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
END $$;

-- ----------------------------------------------------------------------------
-- 6. Ham danh dau da doc cho tin nhan doi phuong gui trong 1 hoi thoai
--    SECURITY DEFINER de bo qua RLS (nguoi nhan danh dau doc tin cua nguoi gui).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_thread_read(p_thread_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  updated integer;
BEGIN
  UPDATE chat_messages
     SET read = true
   WHERE thread_id = p_thread_id
     AND sender_id <> uid
     AND read = false;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_thread_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_thread_read(uuid) TO authenticated;