-- ============================================================================
-- 13. FIX: CHO PHEP MOI USER CAP NHAT STOCK SAN PHAM
-- ----------------------------------------------------------------------------
-- Van de:
--   - Khi nguoi mua dat hang, app goi syncProductStock de giam stock cua san
--     pham cua NGUOI BAN.
--   - Nhung policy UPDATE hien tai tren bang `products` chi cho PHUONG:
--       "Sellers can update own products" (seller_id = auth.uid())
--     -> nguoi mua khong phai la seller nen bi RLS chan:
--       "new row violates row-level security policy for table \"products\""
-- Giai phap:
--   - Them policy "Anyone can update stock on products" cho phep moi user da
--     dang nhap UPDATE bang products (khap y dinh cua docs/sql/08-rls-policies.sql).
--
-- CAN CHAY FILE NAY TRONG SUPABASE SQL EDITOR (chay lai duoc nhieu lan).
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can update stock on products" ON products;
CREATE POLICY "Anyone can update stock on products"
  ON products FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
