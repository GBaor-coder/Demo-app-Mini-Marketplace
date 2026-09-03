-- ============================================================================
-- 12. DELETE ACCOUNT
-- RPC: delete_current_user
-- ----------------------------------------------------------------------------
-- Van de goc:
--   - Client khong the xoa duoc row trong auth.users (vi tri ngoai RLS/public).
--   - Bang profiles khong co policy DELETE -> client khong tu xoa profile duoc.
-- Giai phap:
--   - Xoa file trong SUPABASE STORAGE duoc thuc hien O PHIA CLIENT bang
--     storage API (Supabase cam DELETE truc tiep tren bang storage.objects:
--       "Direct deletion from storage table is not allowed. use the storage api
--       instead."). Vi vay app se:
--       1) (client) gom path anh -> xoa qua supabase.storage.from(...).remove()
--       2) (client) goi RPC nay de xoa DU LIEU DATABASE.
--   - Function nay chi xu ly du lieu bang (profiles + auth.users):
--       * Xoa row profiles (id = auth.uid()) -> cascade xoa toan bo du lieu con
--         (products, orders, favorites, cart_lines, reviews, chat_threads,
--          chat_messages, saved_addresses, notifications).
--       * Xoa row auth.users -> khong the dang nhap lai.
--   - Vi child tables cua profiles dung `ON DELETE CASCADE`, xoa profiles la
--     du; xoa auth.users don thuan de thu hoi quyen dang nhap.
--
-- CAN CHAY FILE NAY TRONG SUPABASE SQL EDITOR.
-- ============================================================================

-- Xoa function cu neu co (de chay lai duoc nhieu lan - idempotent)
DROP FUNCTION IF EXISTS public.delete_current_user();

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Bạn cần đăng nhập trước khi xóa tài khoản.';
  END IF;

  -- Xoa profile -> cascade xoa toan bo du lieu lien quan
  DELETE FROM public.profiles WHERE id = v_uid;

  -- Xoa auth.users -> thu hoi quyen dang nhap
  DELETE FROM auth.users WHERE id = v_uid;

  RETURN;
END;
$$;

-- ============================================================================
-- PHAN QUYEN: chi cho phep role authenticated goi function nay
-- ============================================================================
REVOKE ALL ON FUNCTION public.delete_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;

-- ----------------------------------------------------------------------------
-- GHI CHU THU CONG:
--   - Vi `auth` schema khong thuoc search_path mac dinh cua function, ta dung
--     ten day du `auth.users` / `auth.uid()` o tren.
--   - File trong storage phai duoc xoa truoc khi goi RPC nay (tu phia client)
--     vi Supabase khong cho xoa truc tiep bang storage.objects.
-- ============================================================================
