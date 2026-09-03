-- ============================================================================
-- 15. FIX BỀN VỮNG: RPC mark_product_sold (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Van de:
--   - markProductSold dung `.update()` truc tiep tren bang `products`
--     (`stock=0, status='sold'`) nen bi RLS chan:
--       "new row violates row-level security policy for table \"products\""
-- Giai phap:
--   - Tao RPC SECURITY DEFINER chay voi quyen OWNER (postgres) -> RLS BO QUA
--     hoan toan.
--   - Chi update cot `stock` va `status` (an toan).
--
-- CAN CHAY FILE NAY TRONG SUPABASE SQL EDITOR (chay lai duoc nhieu lan).
-- ============================================================================

DROP FUNCTION IF EXISTS public.mark_product_sold(uuid);

CREATE OR REPLACE FUNCTION public.mark_product_sold(
  p_product_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = 0,
      status = 'sold'
  WHERE id = p_product_id;
END;
$$;

-- ============================================================================
-- PHAN QUYEN: chi cho phep role authenticated goi function nay
-- ============================================================================
REVOKE ALL ON FUNCTION public.mark_product_sold(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_product_sold(uuid) TO authenticated;
