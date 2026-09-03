-- ============================================================================
-- 14. FIX BỀN VỮNG: RPC sync_product_stock (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Van de:
--   - Dù policy "Anyone can update stock on products" (PERMISSIVE, USING(true),
--     WITH CHECK(true)) da ton tai, PATCH update stock van co the bi chan 403/
--     42501 neu request chay voi role khong phai `authenticated` (vi du `anon`)
--     hoac vi cac subtetly khac cua RLS.
-- Giai phap:
--   - Tao RPC SECURITY DEFINER chay voi quyen OWNER (postgres) -> RLS bi BO
--     QUA hoan toan (table owner khong bi RLS tam ngoai tru FORCE RLS).
--   - Update chi anh huong toi cot `stock` va `status` (an toan, khong cho
--     sua cac cot khac nhu gia/tieu de cua nguoi dung khac).
--
-- CAN CHAY FILE NAY TRONG SUPABASE SQL EDITOR (chay lai duoc nhieu lan).
-- ============================================================================

DROP FUNCTION IF EXISTS public.sync_product_stock(uuid, integer);

CREATE OR REPLACE FUNCTION public.sync_product_stock(
  p_product_id uuid,
  p_stock      integer
)
RETURNS TABLE (o_stock integer, o_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock integer := GREATEST(0, p_stock);
BEGIN
  UPDATE public.products
  SET stock = v_stock,
      status = CASE WHEN v_stock <= 0 THEN 'sold' ELSE status END
  WHERE id = p_product_id
  RETURNING stock, status INTO o_stock, o_status;

  IF o_stock IS NULL THEN
    RETURN;
  END IF;

  RETURN NEXT;
END;
$$;

-- ============================================================================
-- PHAN QUYEN: chi cho phep role authenticated goi function nay
-- ============================================================================
REVOKE ALL ON FUNCTION public.sync_product_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_product_stock(uuid, integer) TO authenticated;
