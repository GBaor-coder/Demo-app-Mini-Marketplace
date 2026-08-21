-- ============================================================================
-- UniLoop - Mini Marketplace Database Schema
-- Profiles da co san -> chi tao cac bang con lai + seed data
-- Chay toan bo file nay trong Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- 2.1 locations
CREATE TABLE IF NOT EXISTS locations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  address_text TEXT NOT NULL DEFAULT '',
  label        TEXT NOT NULL DEFAULT '',
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 products
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  price          INTEGER NOT NULL DEFAULT 0,
  category       TEXT NOT NULL,
  condition      TEXT NOT NULL DEFAULT 'Đã sử dụng',
  stock          INTEGER NOT NULL DEFAULT 1,
  image          TEXT NOT NULL DEFAULT '',
  images         TEXT[] NOT NULL DEFAULT '{}',
  location_id    UUID REFERENCES locations(id) ON DELETE SET NULL,
  meetup_point   TEXT DEFAULT '',
  allows_meetup  BOOLEAN NOT NULL DEFAULT true,
  allows_cod     BOOLEAN NOT NULL DEFAULT false,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 orders
CREATE TABLE IF NOT EXISTS orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code           TEXT NOT NULL UNIQUE,
  buyer_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items                JSONB NOT NULL DEFAULT '[]',
  shipping_fee         INTEGER NOT NULL DEFAULT 0,
  platform_fee         INTEGER NOT NULL DEFAULT 0,
  total                INTEGER NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_transaction', 'completed', 'cancelled', 'rejected'
  )),
  delivery_method      TEXT NOT NULL DEFAULT 'meetup' CHECK (delivery_method IN ('meetup', 'cod')),
  delivery_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  note                 TEXT NOT NULL DEFAULT '',
  cancel_reason        TEXT DEFAULT NULL,
  cancelled_at         TIMESTAMPTZ DEFAULT NULL,
  completed_at         TIMESTAMPTZ DEFAULT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 saved_addresses
CREATE TABLE IF NOT EXISTS saved_addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label        TEXT NOT NULL DEFAULT '',
  recipient    TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  province     TEXT NOT NULL DEFAULT '',
  district     TEXT NOT NULL DEFAULT '',
  ward         TEXT NOT NULL DEFAULT '',
  street       TEXT NOT NULL DEFAULT '',
  building     TEXT NOT NULL DEFAULT '',
  room         TEXT NOT NULL DEFAULT '',
  location_id  UUID REFERENCES locations(id) ON DELETE SET NULL,
  is_default   BOOLEAN NOT NULL DEFAULT false,
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 favorites
CREATE TABLE IF NOT EXISTS favorites (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- 2.6 cart_lines
CREATE TABLE IF NOT EXISTS cart_lines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1,
  selected   BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- 2.7 reviews
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  content    TEXT NOT NULL DEFAULT '',
  images     TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 chat_threads
CREATE TABLE IF NOT EXISTS chat_threads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (participant_1 <> participant_2)
);

-- 2.9 chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id         UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text              TEXT NOT NULL DEFAULT '',
  read              BOOLEAN NOT NULL DEFAULT false,
  offer_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.10 notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('order', 'message', 'other')),
  title      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '',
  icon       TEXT NOT NULL DEFAULT '',
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_seller     ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status     ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created    ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer        ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller       ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created      ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_addresses_user ON saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user      ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product   ON favorites(product_id);

CREATE INDEX IF NOT EXISTS idx_cart_lines_user     ON cart_lines(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_lines_product  ON cart_lines(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product     ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order       ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author      ON reviews(author_id);

CREATE INDEX IF NOT EXISTS idx_chat_threads_p1     ON chat_threads(participant_1);
CREATE INDEX IF NOT EXISTS idx_chat_threads_p2     ON chat_threads(participant_2);
CREATE INDEX IF NOT EXISTS idx_chat_threads_product ON chat_threads(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read  ON notifications(user_id, read);

-- ============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_cart_lines_updated_at ON cart_lines;
CREATE TRIGGER update_cart_lines_updated_at
  BEFORE UPDATE ON cart_lines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_chat_threads_updated_at ON chat_threads;
CREATE TRIGGER update_chat_threads_updated_at
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

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
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- locations
CREATE POLICY "Authenticated users can view locations"
  ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert locations"
  ON locations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own locations"
  ON locations FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own locations"
  ON locations FOR DELETE USING (created_by = auth.uid());

-- products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Sellers can insert own products"
  ON products FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE USING (seller_id = auth.uid());

-- orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Sellers can update own orders"
  ON orders FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

-- saved_addresses
CREATE POLICY "Users can view own addresses"
  ON saved_addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own addresses"
  ON saved_addresses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own addresses"
  ON saved_addresses FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own addresses"
  ON saved_addresses FOR DELETE USING (user_id = auth.uid());

-- favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can add own favorites"
  ON favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE USING (user_id = auth.uid());

-- cart_lines
CREATE POLICY "Users can view own cart"
  ON cart_lines FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own cart lines"
  ON cart_lines FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own cart lines"
  ON cart_lines FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own cart lines"
  ON cart_lines FOR DELETE USING (user_id = auth.uid());

-- reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update own reviews"
  ON reviews FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can delete own reviews"
  ON reviews FOR DELETE USING (author_id = auth.uid());

-- chat_threads
CREATE POLICY "Participants can view own threads"
  ON chat_threads FOR SELECT USING (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Authenticated users can create threads"
  ON chat_threads FOR INSERT TO authenticated WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Participants can update own threads"
  ON chat_threads FOR UPDATE
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid())
  WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- chat_messages
CREATE POLICY "Thread participants can view messages"
  ON chat_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
        AND (chat_threads.participant_1 = auth.uid() OR chat_threads.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Thread participants can insert messages"
  ON chat_messages FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
        AND (chat_threads.participant_1 = auth.uid() OR chat_threads.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Sender can update own messages"
  ON chat_messages FOR UPDATE USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

-- notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 6. STORAGE BUCKETS & POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products', 'products', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('avatars',  'avatars',  true, 2097152, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('reviews',  'reviews',  true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Products bucket
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Avatars bucket
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Reviews bucket
CREATE POLICY "Anyone can view review images"
  ON storage.objects FOR SELECT USING (bucket_id = 'reviews');
CREATE POLICY "Authenticated users can upload review images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reviews');
CREATE POLICY "Users can delete own review images"
  ON storage.objects FOR DELETE USING (bucket_id = 'reviews');

-- ============================================================================
-- 7. SEED DATA
-- UUID phai la hex hop le (0-9, a-f).
-- dang ky tai khoan demo qua app truoc, trigger se tu tao profile.
-- sau do chay seed nay de insert du lieu mau.
-- ============================================================================

DO $$
DECLARE
  -- Profiles (phai trung voi ID tu Supabase Auth khi dang ky)
  buyer1_id  UUID := '00000000-0000-0000-0000-000000000001';
  seller1_id UUID := '00000000-0000-0000-0000-000000000002';
  seller2_id UUID := '00000000-0000-0000-0000-000000000003';
  seller3_id UUID := '00000000-0000-0000-0000-000000000004';

  -- Locations
  loc_seller1 UUID := '10000000-0000-0000-0000-000000000001';
  loc_seller2 UUID := '10000000-0000-0000-0000-000000000002';
  loc_seller3 UUID := '10000000-0000-0000-0000-000000000003';
  loc_default UUID := '10000000-0000-0000-0000-000000000004';
  loc_order2  UUID := '10000000-0000-0000-0000-000000000005';
  loc_chat1   UUID := '10000000-0000-0000-0000-000000000006';

  -- Products
  p1  UUID := '20000000-0000-0000-0000-000000000001';
  p2  UUID := '20000000-0000-0000-0000-000000000002';
  p3  UUID := '20000000-0000-0000-0000-000000000003';
  p4  UUID := '20000000-0000-0000-0000-000000000004';
  p5  UUID := '20000000-0000-0000-0000-000000000005';
  p6  UUID := '20000000-0000-0000-0000-000000000006';
  p7  UUID := '20000000-0000-0000-0000-000000000007';
  p8  UUID := '20000000-0000-0000-0000-000000000008';
  p9  UUID := '20000000-0000-0000-0000-000000000009';
  p10 UUID := '20000000-0000-0000-0000-000000000010';
  p11 UUID := '20000000-0000-0000-0000-000000000011';
  p12 UUID := '20000000-0000-0000-0000-000000000012';
  p13 UUID := '20000000-0000-0000-0000-000000000013';

  -- Orders
  o1 UUID := '30000000-0000-0000-0000-000000000001';
  o2 UUID := '30000000-0000-0000-0000-000000000002';
  o3 UUID := '30000000-0000-0000-0000-000000000003';

  -- Addresses
  a1 UUID := '40000000-0000-0000-0000-000000000001';
  a2 UUID := '40000000-0000-0000-0000-000000000002';
  a3 UUID := '40000000-0000-0000-0000-000000000003';

  -- Reviews
  r1 UUID := '50000000-0000-0000-0000-000000000001';

  -- Chat threads
  chat1 UUID := '60000000-0000-0000-0000-000000000001';
  chat2 UUID := '60000000-0000-0000-0000-000000000002';

  -- Chat messages
  m1  UUID := '70000000-0000-0000-0000-000000000001';
  m2  UUID := '70000000-0000-0000-0000-000000000002';
  m3  UUID := '70000000-0000-0000-0000-000000000003';
  m4  UUID := '70000000-0000-0000-0000-000000000004';
  m5  UUID := '70000000-0000-0000-0000-000000000005';
  m6  UUID := '70000000-0000-0000-0000-000000000006';

  -- Notifications
  n1 UUID := '80000000-0000-0000-0000-000000000001';
  n2 UUID := '80000000-0000-0000-0000-000000000002';
  n3 UUID := '80000000-0000-0000-0000-000000000003';
  n4 UUID := '80000000-0000-0000-0000-000000000004';

BEGIN

-- Locations
INSERT INTO locations (id, latitude, longitude, address_text, label, created_by) VALUES
  (loc_seller1, 10.772178, 106.657913, 'Cổng Lý Thường Kiệt, Đại học Bách Khoa, Quận 10', 'Bách Khoa', seller1_id),
  (loc_seller2, 10.87564,  106.80039,  'Ký túc xá Khu B, ĐHQG TP.HCM, TP. Thủ Đức', 'KTX ĐHQG', seller2_id),
  (loc_seller3, 10.7721,   106.6837,   'Đại học Kinh tế TP.HCM, Quận 3, TP.HCM', 'ĐH Kinh tế', seller3_id),
  (loc_default, 10.762622, 106.660172, 'Đại học Bách Khoa TP.HCM, Quận 10, TP.HCM', 'Mặc định', NULL),
  (loc_order2,  10.8471,   106.7686,   '123 Đường Tự Do, Phường Bình Thọ, TP. Thủ Đức', 'Nhà riêng', buyer1_id),
  (loc_chat1,   10.7721,   106.6837,   'Cổng chính Tòa nhà A, khuôn viên trường Đại học', 'Hẹn gặp', seller3_id)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, seller_id, title, description, price, category, condition, stock, image, images, location_id, meetup_point, allows_meetup, allows_cod, status, created_at) VALUES
  (p1, seller1_id, 'Giáo trình Kinh tế vi mô (Tái bản lần 5)',
   'Sách còn sạch, không rách, có ghi chú bằng bút chì ở một vài chương. Phù hợp sinh viên năm nhất.',
   85000, 'Giáo trình', 'Đã sử dụng', 2,
   'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900',
   ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900','https://images.unsplash.com/photo-1532012197267-da84d127e765?w=900'],
   loc_seller1, 'Cổng Lý Thường Kiệt, ĐHBK', true, true, 'active', '2026-07-28T08:30:00.000Z'),

  (p2, seller1_id, 'Máy tính Casio FX-580VN X chính hãng',
   'Máy hoạt động ổn định, phím còn nhạy, kèm nắp bảo vệ. Mới 99%.',
   420000, 'Đồ điện tử', 'Như mới', 1,
   'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900',
   ARRAY['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900'],
   loc_seller1, 'Thư viện trung tâm ĐHBK', true, true, 'active', '2026-07-27T10:15:00.000Z'),

  (p3, seller1_id, 'Đèn bàn học chống cận LED',
   'Ba mức sáng, cổng sạc USB, chân đèn chắc chắn. Thanh lý do chuyển phòng trọ.',
   150000, 'Đồ ký túc xá', 'Đã sử dụng', 1,
   'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900',
   ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900'],
   loc_seller1, 'KTX ĐHBK', true, false, 'active', '2026-07-25T15:20:00.000Z'),

  (p4, seller1_id, 'Bàn phím Bluetooth nhỏ gọn',
   'Kết nối tốt với laptop, máy tính bảng và điện thoại. Pin dùng khoảng một tuần.',
   260000, 'Đồ điện tử', 'Đã sử dụng', 1,
   'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900',
   ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900'],
   loc_seller1, 'Cổng trường ĐHBK', true, true, 'active', '2026-07-24T09:00:00.000Z'),

  (p5, seller2_id, 'Túi tote canvas thêu tay',
   'Túi canvas dày, họa tiết thêu thủ công, có ngăn nhỏ bên trong. Có thể đặt màu theo yêu cầu.',
   145000, 'Handmade', 'Như mới', 5,
   'https://images.unsplash.com/photo-1597633125097-5a9961e1f03d?w=900',
   ARRAY['https://images.unsplash.com/photo-1597633125097-5a9961e1f03d?w=900','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900'],
   loc_seller2, 'KTX Khu B, ĐHQG', true, true, 'active', '2026-07-29T07:45:00.000Z'),

  (p6, seller2_id, 'Nồi cơm điện mini 1.2L',
   'Kích thước phù hợp phòng ký túc xá, đủ cho 1-2 người. Lòng nồi chống dính còn tốt.',
   330000, 'Đồ ký túc xá', 'Đã sử dụng', 1,
   'https://images.unsplash.com/photo-1585515320310-259814833e62?w=900',
   ARRAY['https://images.unsplash.com/photo-1585515320310-259814833e62?w=900'],
   loc_seller2, 'KTX Khu B, ĐHQG', true, false, 'active', '2026-07-23T12:10:00.000Z'),

  (p7, seller2_id, 'Tai nghe chụp tai Bluetooth',
   'Âm thanh rõ, đệm tai mềm, sạc Type-C. Tặng kèm túi đựng chống bụi.',
   390000, 'Đồ điện tử', 'Đã sử dụng', 2,
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
   ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900'],
   loc_seller2, 'KTX Khu B, ĐHQG', true, true, 'active', '2026-07-22T16:30:00.000Z'),

  (p8, seller1_id, 'Bộ bút highlight 6 màu',
   'Màu pastel dịu mắt, đầu bút còn mới. Bán theo bộ 6 cây như hình.',
   48000, 'Đồ dùng học tập', 'Như mới', 3,
   'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900',
   ARRAY['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900'],
   loc_seller1, 'Cổng trường ĐHBK', true, false, 'active', '2026-07-21T08:00:00.000Z'),

  (p9, seller3_id, 'Giáo trình Nhập môn Lập trình Web (bản in màu 2023)',
   'Bản in màu còn nguyên vẹn, không ghi chú. Hợp kỳ sau.',
   120000, 'Giáo trình', 'Như mới', 1,
   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900',
   ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900'],
   loc_seller3, 'Cổng ĐH Kinh tế', true, true, 'active', '2026-07-20T09:00:00.000Z'),

  (p10, seller3_id, 'Balo laptop sinh viên chống nước 15.6 inch',
   'Nhiều ngăn, chống nước tốt, quai đeo chắc chắn. Màu xám. Đã dùng 6 tháng còn rất mới.',
   250000, 'Thời trang', 'Đã sử dụng', 1,
   'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900',
   ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900'],
   loc_seller3, 'Thư viện ĐH Kinh tế', true, false, 'active', '2026-07-18T14:00:00.000Z'),

  (p11, seller1_id, 'Giáo trình Toán Cao Cấp A1',
   'Sách còn mới 90%, không ghi chú bên trong. Dùng cho sinh viên khối kỹ thuật.',
   50000, 'Giáo trình', 'Đã sử dụng', 1,
   'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=900',
   ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=900'],
   loc_seller1, 'Cổng Lý Thường Kiệt', true, true, 'active', '2026-07-16T11:00:00.000Z'),

  (p12, seller3_id, 'Đèn bàn LED thông minh không nhấp nháy',
   'Điều chỉnh 3 chế độ sáng, cổng USB sạc điện thoại, tiết kiệm điện.',
   120000, 'Đồ ký túc xá', 'Như mới', 1,
   'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=900',
   ARRAY['https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=900'],
   loc_seller3, 'KTX ĐH Kinh tế', true, false, 'active', '2026-07-14T10:00:00.000Z'),

  (p13, seller2_id, 'Bộ họa cụ cơ bản sinh viên Mỹ thuật',
   'Gồm bút chì, tẩy, thước cong, màu nước. Còn dùng tốt, bán vì không còn học nữa.',
   210000, 'Đồ dùng học tập', 'Đã sử dụng', 1,
   'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=900',
   ARRAY['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=900'],
   loc_seller2, 'KTX Khu B, ĐHQG', true, true, 'active', '2026-07-12T09:30:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO orders (id, order_code, buyer_id, seller_id, items, shipping_fee, platform_fee, total, status, delivery_method, delivery_location_id, note, completed_at, created_at) VALUES
  (o1, 'UL240701', buyer1_id, seller1_id,
   '[{"productId":"20000000-0000-0000-0000-000000000001","title":"Giáo trình Kinh tế vi mô","image":"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900","price":85000,"quantity":1,"condition":"Cũ 90%"}]',
   0, 0, 85000, 'completed', 'meetup', loc_default,
   'Nhận tại cổng trường sau 17 giờ.', '2026-07-22T11:00:00.000Z', '2026-07-20T10:00:00.000Z'),

  (o2, 'UL240702', buyer1_id, seller3_id,
   '[{"productId":"20000000-0000-0000-0000-000000000009","title":"Giáo trình Nhập môn Lập trình Web","image":"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900","price":120000,"quantity":1,"condition":"Mới 99%"}]',
   15000, 0, 135000, 'in_transaction', 'cod', loc_order2,
   '', NULL, '2026-08-08T10:30:00.000Z'),

  (o3, 'UL240703', buyer1_id, seller1_id,
   '[{"productId":"20000000-0000-0000-0000-000000000002","title":"Máy tính Casio FX-580VN X","image":"https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900","price":420000,"quantity":1,"condition":"Mới 99%"}]',
   0, 0, 420000, 'confirmed', 'meetup', loc_default,
   'Hẹn gặp tại thư viện lúc 16:00.', NULL, '2026-08-09T08:15:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Saved Addresses
INSERT INTO saved_addresses (id, user_id, label, recipient, phone, province, district, ward, street, building, room, location_id, is_default, notes) VALUES
  (a1, buyer1_id, 'Ký túc xá', 'Nguyễn Thu Trang', '0901 234 567',
   'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Phường Linh Trung',
   'Phòng 405, Tòa nhà A1', 'Ký túc xá ĐHQG', 'Phòng 405',
   loc_seller2, true, 'Gọi trước khi giao'),

  (a2, buyer1_id, 'Nhà riêng', 'Nguyễn Thu Trang', '0901 234 567',
   'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Phường Bình Thọ',
   '123 Đường Tự Do', '', '',
   loc_order2, false, ''),

  (a3, buyer1_id, 'Văn phòng', 'Nguyễn Thu Trang', '0901 234 567',
   'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Phường Linh Trung',
   'Tòa nhà Thư viện Trung tâm', 'Khu đô thị ĐHQG-HCM', '',
   NULL, false, '')
ON CONFLICT (id) DO NOTHING;

-- Reviews
INSERT INTO reviews (id, order_id, author_id, product_id, rating, content, images, created_at) VALUES
  (r1, o1, buyer1_id, p1, 5,
   'Sách đúng như mô tả, bạn bán nhiệt tình. Giao đúng hẹn. Rất hài lòng!',
   '{}', '2026-07-23T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Chat Threads
INSERT INTO chat_threads (id, participant_1, participant_2, product_id, updated_at, created_at) VALUES
  (chat1, buyer1_id, seller3_id, p9, '2026-08-08T14:40:00.000Z', '2026-08-08T14:32:00.000Z'),
  (chat2, buyer1_id, seller1_id, p2, '2026-08-09T09:00:00.000Z', '2026-08-09T08:55:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Chat Messages
INSERT INTO chat_messages (id, thread_id, sender_id, text, read, offer_location_id, created_at) VALUES
  (m1, chat1, buyer1_id,  'Chào bạn, cuốn giáo trình này bạn còn giữ không?', true, NULL, '2026-08-08T14:32:00.000Z'),
  (m2, chat1, seller3_id, 'Sách vẫn còn nhé. Tình trạng khoảng 90%.', true, NULL, '2026-08-08T14:35:00.000Z'),
  (m3, chat1, buyer1_id,  'Tuyệt quá. Bạn có thể giao dịch ở trường chiều nay không?', true, NULL, '2026-08-08T14:36:00.000Z'),
  (m4, chat1, seller3_id, 'Được nha, mình chốt lịch này nhé:', true, loc_chat1, '2026-08-08T14:40:00.000Z'),
  (m5, chat2, buyer1_id,  'Máy còn bảo hành không bạn?', true, NULL, '2026-08-09T08:55:00.000Z'),
  (m6, chat2, seller1_id, 'Còn nha, mình bảo hành thêm 1 tháng.', false, NULL, '2026-08-09T09:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, type, title, body, icon, read, created_at) VALUES
  (n1, buyer1_id, 'order', 'Đơn hàng #UL240702 đã được giao thành công',
   'Vui lòng xác nhận đã nhận hàng.', 'local_shipping', false, '2026-08-09T13:00:00.000Z'),
  (n2, buyer1_id, 'order', 'Đơn hàng #UL240703 đang được giao',
   'Shipper đang trên đường giao hàng.', 'local_shipping', true, '2026-08-08T14:30:00.000Z'),
  (n3, seller1_id, 'other', 'Tin đăng của bạn đã được duyệt',
   'Sản phẩm đã vượt qua kiểm duyệt.', 'campaign', true, '2026-08-06T09:00:00.000Z'),
  (n4, seller1_id, 'message', 'Minh Quân đã nhắn tin cho bạn',
   'Chào bạn, cuốn giáo trình này bạn còn giữ không?', 'chat', true, '2026-08-05T16:20:00.000Z')
ON CONFLICT (id) DO NOTHING;

END $$;

-- ============================================================================
-- XONG! Chay file nay trong Supabase SQL Editor.
-- ============================================================================
