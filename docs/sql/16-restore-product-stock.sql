-- ============================================================================
-- 16. RPC: restore_product_stock (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Van de:
--   - Khi dat hang, stock san pham da bi giam (qua sync_product_stock).
--   - Khi don hang bi HỦY/from choi (cancelled/rejected), can hoan lai so luong
--     da dat vao kho.
--   - Dung truc tiep `.update()` tren products se bi RLS chan (nhu cac truong
--     hop truoc), nen ta dung RPC SECURITY DEFINER de bo qua RLS.
--
-- CAN CHAY FILE NAY TRONG SUPABASE SQL EDITOR (chay lai duoc nhieu lan).
-- ============================================================================

DROP FUNCTION IF EXISTS public.restore_product_stock(uuid, integer);

CREATE OR REPLACE FUNCTION public.restore_product_stock(
  p_product_id uuid,
  p_qty        integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock + GREATEST(0, p_qty),
      status = CASE WHEN stock + GREATEST(0, p_qty) > 0 THEN 'active' ELSE status END
  WHERE id = p_product_id;
END;
$$;

-- ============================================================================
-- PHAN QUYEN: chi cho phep role authenticated goi function nay
-- ============================================================================
REVOKE ALL ON FUNCTION public.restore_product_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_product_stock(uuid, integer) TO authenticated;
