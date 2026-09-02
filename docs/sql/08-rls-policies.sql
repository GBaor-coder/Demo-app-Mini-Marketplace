-- ROW LEVEL SECURITY (RLS)
-- Script nay co the chay lai nhieu lan (idempotent):
-- moi policy se duoc xoa di truoc khi tao moi.
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_addresses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_lines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"          ON profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- locations
DROP POLICY IF EXISTS "Authenticated users can view locations"  ON locations;
DROP POLICY IF EXISTS "Authenticated users can insert locations" ON locations;
DROP POLICY IF EXISTS "Users can update own locations"           ON locations;
DROP POLICY IF EXISTS "Users can delete own locations"           ON locations;
CREATE POLICY "Authenticated users can view locations"
  ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert locations"
  ON locations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own locations"
  ON locations FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own locations"
  ON locations FOR DELETE USING (created_by = auth.uid());

-- products
DROP POLICY IF EXISTS "Anyone can view active products"  ON products;
DROP POLICY IF EXISTS "Sellers can insert own products"  ON products;
DROP POLICY IF EXISTS "Sellers can update own products"  ON products;
DROP POLICY IF EXISTS "Sellers can delete own products"  ON products;
DROP POLICY IF EXISTS "Anyone can update stock on products" ON products;
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Sellers can insert own products"
  ON products FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE USING (seller_id = auth.uid());
CREATE POLICY "Anyone can update stock on products"
  ON products FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- orders
DROP POLICY IF EXISTS "Buyers can view own orders" ON orders;
DROP POLICY IF EXISTS "Buyers can create orders"   ON orders;
DROP POLICY IF EXISTS "Seller can update own orders" ON orders;
DROP POLICY IF EXISTS "Buyers and sellers can update orders" ON orders;
CREATE POLICY "Buyers can view own orders"
  ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Seller can update own orders"
  ON orders FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Buyers and sellers can update orders"
  ON orders FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

-- saved_addresses
DROP POLICY IF EXISTS "Users can view own addresses"   ON saved_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON saved_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON saved_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON saved_addresses;
CREATE POLICY "Users can view own addresses"
  ON saved_addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own addresses"
  ON saved_addresses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own addresses"
  ON saved_addresses FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own addresses"
  ON saved_addresses FOR DELETE USING (user_id = auth.uid());

-- favorites
DROP POLICY IF EXISTS "Users can view own favorites"  ON favorites;
DROP POLICY IF EXISTS "Users can add own favorites"   ON favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can add own favorites"
  ON favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE USING (user_id = auth.uid());

-- cart_lines
DROP POLICY IF EXISTS "Users can view own cart"        ON cart_lines;
DROP POLICY IF EXISTS "Users can insert own cart lines" ON cart_lines;
DROP POLICY IF EXISTS "Users can update own cart lines" ON cart_lines;
DROP POLICY IF EXISTS "Users can delete own cart lines" ON cart_lines;
CREATE POLICY "Users can view own cart"
  ON cart_lines FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own cart lines"
  ON cart_lines FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own cart lines"
  ON cart_lines FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own cart lines"
  ON cart_lines FOR DELETE USING (user_id = auth.uid());

-- reviews
DROP POLICY IF EXISTS "Anyone can view reviews"             ON reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Authors can update own reviews"      ON reviews;
DROP POLICY IF EXISTS "Authors can delete own reviews"      ON reviews;
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update own reviews"
  ON reviews FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can delete own reviews"
  ON reviews FOR DELETE USING (author_id = auth.uid());

-- chat_threads
DROP POLICY IF EXISTS "Participants can view own threads"     ON chat_threads;
DROP POLICY IF EXISTS "Authenticated users can create threads" ON chat_threads;
DROP POLICY IF EXISTS "Participants can update own threads"   ON chat_threads;
CREATE POLICY "Participants can view own threads"
  ON chat_threads FOR SELECT USING (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Authenticated users can create threads"
  ON chat_threads FOR INSERT TO authenticated WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Participants can update own threads"
  ON chat_threads FOR UPDATE
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid())
  WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- chat_messages
DROP POLICY IF EXISTS "Thread participants can view messages"  ON chat_messages;
DROP POLICY IF EXISTS "Thread participants can insert messages" ON chat_messages;
DROP POLICY IF EXISTS "Sender can update own messages"         ON chat_messages;
CREATE POLICY "Thread participants can view messages"
  ON chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_threads WHERE chat_threads.id = chat_messages.thread_id
      AND (chat_threads.participant_1 = auth.uid() OR chat_threads.participant_2 = auth.uid()))
  );
CREATE POLICY "Thread participants can insert messages"
  ON chat_messages FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM chat_threads WHERE chat_threads.id = chat_messages.thread_id
      AND (chat_threads.participant_1 = auth.uid() OR chat_threads.participant_2 = auth.uid()))
  );
CREATE POLICY "Sender can update own messages"
  ON chat_messages FOR UPDATE USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications"  ON notifications;
DROP POLICY IF EXISTS "System can insert notifications"   ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE USING (user_id = auth.uid());
