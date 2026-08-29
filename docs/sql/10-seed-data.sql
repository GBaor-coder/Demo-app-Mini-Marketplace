-- ============================================================================
-- SEED DATA (dung 3 tai khoan that da tao qua app)
--
-- PHAN BO VAI TRO:
--   buyer1  : giabao.bt123456@gmail.com        (Phan Gia Bảo)
--   seller1 : dangngocthaibao.thd@gmail.com    (Thái Bảo)
--   seller2 : ttrangdth@gmail.com              (Trang)
--
-- Ghi chu:
-- - Khong tao them tai khoan moi trong auth.users.
-- - San pham/chat cua "seller3" trong ban goc duoc gop vao seller2.
-- - Chay lai nhieu lan khong bi loi: truoc insert se DELETE du lieu seed cu (cac id
--   co dinh) roi INSERT lai (ON CONFLICT DO NOTHING) => chay lai la sach, khong nhan doi.
-- - Chay SAU CUNG sau khi da chay cac file schema + RLS policies.
-- ============================================================================

DO $$
DECLARE
  -- ===== TAI KHOAN THAT (lay tu Supabase Auth > Users) =====
  buyer1_id  UUID := '6d9ac9ae-b31c-48df-a1ec-cb6fd993a81c';  -- giabao.bt123456@gmail.com
  seller1_id UUID := 'a7d1af0d-ccf6-43c3-a1fd-9e307692ee04';  -- dangngocthaibao.thd@gmail.com
  seller2_id UUID := 'a7c69de4-1657-4bb9-a875-8d8389384655';  -- ttrangdth@gmail.com

  loc_seller1 UUID := 'b0000000-0000-0000-0000-000000000001';
  loc_seller2 UUID := 'b0000000-0000-0000-0000-000000000002';
  loc_seller3 UUID := 'b0000000-0000-0000-0000-000000000003';
  loc_default UUID := 'b0000000-0000-0000-0000-000000000004';
  loc_order2  UUID := 'b0000000-0000-0000-0000-000000000005';
  loc_chat1   UUID := 'b0000000-0000-0000-0000-000000000006';

  p1  UUID := 'c0000000-0000-0000-0000-000000000001';
  p2  UUID := 'c0000000-0000-0000-0000-000000000002';
  p3  UUID := 'c0000000-0000-0000-0000-000000000003';
  p4  UUID := 'c0000000-0000-0000-0000-000000000004';
  p5  UUID := 'c0000000-0000-0000-0000-000000000005';
  p6  UUID := 'c0000000-0000-0000-0000-000000000006';
  p7  UUID := 'c0000000-0000-0000-0000-000000000007';
  p8  UUID := 'c0000000-0000-0000-0000-000000000008';
  p9  UUID := 'c0000000-0000-0000-0000-000000000009';
  p10 UUID := 'c0000000-0000-0000-0000-000000000010';
  p11 UUID := 'c0000000-0000-0000-0000-000000000011';
  p12 UUID := 'c0000000-0000-0000-0000-000000000012';
  p13 UUID := 'c0000000-0000-0000-0000-000000000013';

  o1 UUID := 'd0000000-0000-0000-0000-000000000001';
  o2 UUID := 'd0000000-0000-0000-0000-000000000002';
  o3 UUID := 'd0000000-0000-0000-0000-000000000003';

  a1 UUID := 'e0000000-0000-0000-0000-000000000001';
  a2 UUID := 'e0000000-0000-0000-0000-000000000002';
  a3 UUID := 'e0000000-0000-0000-0000-000000000003';

  chat1 UUID := 'f0000000-0000-0000-0000-000000000001';
  chat2 UUID := 'f0000000-0000-0000-0000-000000000002';

  r1 UUID := 'aa000000-0000-0000-0000-000000000001';

  -- chat_messages.id la UUID -> phai dung UUID hop le
  m1 UUID := 'ad000000-0000-0000-0000-000000000001';
  m2 UUID := 'ad000000-0000-0000-0000-000000000002';
  m3 UUID := 'ad000000-0000-0000-0000-000000000003';
  m4 UUID := 'ad000000-0000-0000-0000-000000000004';
  m5 UUID := 'ad000000-0000-0000-0000-000000000005';
  m6 UUID := 'ad000000-0000-0000-0000-000000000006';

  n1 UUID := 'ab000000-0000-0000-0000-000000000001';
  n2 UUID := 'ab000000-0000-0000-0000-000000000002';
  n3 UUID := 'ab000000-0000-0000-0000-000000000003';
  n4 UUID := 'ab000000-0000-0000-0000-000000000004';

BEGIN

-- ============================================================================
-- BUOC 1: Dam bao profiles ton tai cho 3 user (neu trigger chua tao)
-- ============================================================================
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (buyer1_id), (seller1_id), (seller2_id)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;

-- ============================================================================
-- BUOC 1.5: XOA DU LIEU SEED CU (de chay lai sach, khong bi ON CONFLICT bo qua)
-- Xoa con truoc, cha sau theo quan he khoa ngoai.
-- ============================================================================
DELETE FROM chat_messages
WHERE id IN (m1, m2, m3, m4, m5, m6)
   OR thread_id IN (chat1, chat2);

DELETE FROM chat_threads WHERE id IN (chat1, chat2);

DELETE FROM notifications WHERE id IN (n1, n2, n3, n4);

DELETE FROM reviews WHERE id IN (r1);

DELETE FROM saved_addresses WHERE id IN (a1, a2, a3);

DELETE FROM orders WHERE id IN (o1, o2, o3);

DELETE FROM products
WHERE id IN (p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13);

DELETE FROM locations
WHERE id IN (loc_seller1, loc_seller2, loc_seller3, loc_default, loc_order2, loc_chat1);

-- ============================================================================
-- BUOC 2: Du lieu mau
-- ============================================================================

-- Locations
INSERT INTO locations (id, latitude, longitude, address_text, label, created_by) VALUES
  (loc_seller1, 10.4206, 105.6433, 'Cổng chính Trường Đại học Đồng Tháp, 783 Phạm Hữu Lầu, P.6, TP. Cao Lãnh', 'ĐH Đồng Tháp', seller1_id),
  (loc_seller2, 10.4565, 105.6389, 'Ký túc xá sinh viên, P.1, TP. Cao Lãnh, Đồng Tháp', 'KTX Sinh viên', seller2_id),
  (loc_seller3, 10.4412, 105.6274, 'Đường Nguyễn Huệ, P.3, TP. Cao Lãnh, Đồng Tháp', 'Nguyễn Huệ', seller2_id),
  (loc_default, 10.420556, 105.643333, 'Trường Đại học Đồng Tháp, 783 Phạm Hữu Lầu, P.6, TP. Cao Lãnh', 'Mặc định', NULL),
  (loc_order2, 10.4565, 105.6401, '123 Đường Nguyễn Huệ, Phường 1, TP. Cao Lãnh, Đồng Tháp', 'Nhà riêng', buyer1_id),
  (loc_chat1, 10.420556, 105.643333, 'Cổng chính Trường Đại học Đồng Tháp', 'Hẹn gặp', seller2_id)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, seller_id, title, description, price, category, condition, stock, image, images, location_id, meetup_point, allows_meetup, allows_cod, status, created_at) VALUES
  (p1, seller1_id, 'Giáo trình Kinh tế vi mô (Tái bản lần 5)', 'Sách còn sạch, không rách, có ghi chú bằng bút chì ở một vài chương.', 85000, 'Giáo trình', 'Đã sử dụng', 2, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900', ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900','https://images.unsplash.com/photo-1532012197267-da84d127e765?w=900'], loc_seller1, 'Cổng chính Đại học Đồng Tháp', true, true, 'active', '2026-07-28T08:30:00.000Z'),
  (p2, seller1_id, 'Máy tính Casio FX-580VN X chính hãng', 'Máy hoạt động ổn định, phím còn nhạy, kèm nắp bảo vệ.', 420000, 'Đồ điện tử', 'Như mới', 1, 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900', ARRAY['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900'], loc_seller1, 'Thư viện Trường Đại học Đồng Tháp', true, true, 'active', '2026-07-27T10:15:00.000Z'),
  (p3, seller1_id, 'Đèn bàn học chống cận LED', 'Ba mức sáng, cổng sạc USB, chân đèn chắc chắn.', 150000, 'Đồ ký túc xá', 'Đã sử dụng', 1, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900', ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900'], loc_seller1, 'Ký túc xá Đại học Đồng Tháp', true, false, 'active', '2026-07-25T15:20:00.000Z'),
  (p4, seller1_id, 'Bàn phím Bluetooth nhỏ gọn', 'Kết nối tốt với laptop, máy tính bảng và điện thoại.', 260000, 'Đồ điện tử', 'Đã sử dụng', 1, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900', ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900'], loc_seller1, 'Cổng chính Trường Đại học Đồng Tháp', true, true, 'active', '2026-07-24T09:00:00.000Z'),
  (p5, seller2_id, 'Túi tote canvas thêu tay', 'Túi canvas dày, họa tiết thêu thủ công, có ngăn nhỏ bên trong.', 145000, 'Handmade', 'Như mới', 5, 'https://images.unsplash.com/photo-1597633125097-5a9961e1f03d?w=900', ARRAY['https://images.unsplash.com/photo-1597633125097-5a9961e1f03d?w=900','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900'], loc_seller2, 'Ký túc xá sinh viên Cao Lãnh', true, true, 'active', '2026-07-29T07:45:00.000Z'),
  (p6, seller2_id, 'Nồi cơm điện mini 1.2L', 'Kích thước phù hợp phòng ký túc xá, đủ cho 1-2 người.', 330000, 'Đồ ký túc xá', 'Đã sử dụng', 1, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=900', ARRAY['https://images.unsplash.com/photo-1585515320310-259814833e62?w=900'], loc_seller2, 'Ký túc xá sinh viên Cao Lãnh', true, false, 'active', '2026-07-23T12:10:00.000Z'),
  (p7, seller2_id, 'Tai nghe chụp tai Bluetooth', 'Âm thanh rõ, đệm tai mềm, sạc Type-C.', 390000, 'Đồ điện tử', 'Đã sử dụng', 2, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900'], loc_seller2, 'Ký túc xá sinh viên Cao Lãnh', true, true, 'active', '2026-07-22T16:30:00.000Z'),
  (p8, seller1_id, 'Bộ bút highlight 6 màu', 'Màu pastel dịu mắt, đầu bút còn mới.', 48000, 'Đồ dùng học tập', 'Như mới', 3, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900', ARRAY['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900'], loc_seller1, 'Cổng chính Trường Đại học Đồng Tháp', true, false, 'active', '2026-07-21T08:00:00.000Z'),
  (p9, seller2_id, 'Giáo trình Nhập môn Lập trình Web (bản in màu 2023)', 'Bản in màu còn nguyên vẹn, không ghi chú.', 120000, 'Giáo trình', 'Như mới', 1, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900', ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900'], loc_seller3, 'Cổng Trường Đại học Đồng Tháp', true, true, 'active', '2026-07-20T09:00:00.000Z'),
  (p10, seller2_id, 'Balo laptop sinh viên chống nước 15.6 inch', 'Nhiều ngăn, chống nước tốt, quai đeo chắc chắn.', 250000, 'Thời trang', 'Đã sử dụng', 1, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900'], loc_seller3, 'Thư viện Trường Đại học Đồng Tháp', true, false, 'active', '2026-07-18T14:00:00.000Z'),
  (p11, seller1_id, 'Giáo trình Toán Cao Cấp A1', 'Sách còn mới 90%, không ghi chú bên trong.', 50000, 'Giáo trình', 'Đã sử dụng', 1, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=900', ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=900'], loc_seller1, 'Cổng chính Trường Đại học Đồng Tháp', true, true, 'active', '2026-07-16T11:00:00.000Z'),
  (p12, seller2_id, 'Đèn bàn LED thông minh không nhấp nháy', 'Điều chỉnh 3 chế độ sáng, cổng USB sạc điện thoại.', 120000, 'Đồ ký túc xá', 'Như mới', 1, 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=900', ARRAY['https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=900'], loc_seller3, 'Ký túc xá sinh viên Cao Lãnh', true, false, 'active', '2026-07-14T10:00:00.000Z'),
  (p13, seller2_id, 'Bộ họa cụ cơ bản sinh viên Mỹ thuật', 'Gồm bút chì, tẩy, thước cong, màu nước.', 210000, 'Đồ dùng học tập', 'Đã sử dụng', 1, 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=900', ARRAY['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=900'], loc_seller2, 'Ký túc xá sinh viên Cao Lãnh', true, true, 'active', '2026-07-12T09:30:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO orders (id, order_code, buyer_id, seller_id, items, shipping_fee, platform_fee, total, status, delivery_method, delivery_location_id, note, completed_at, created_at) VALUES
  (o1, 'UL240701', buyer1_id, seller1_id, '[{"productId":"c0000000-0000-0000-0000-000000000001","title":"Giáo trình Kinh tế vi mô","image":"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900","price":85000,"quantity":1}]', 0, 0, 85000, 'completed', 'meetup', loc_default, 'Nhận tại cổng trường sau 17 giờ.', '2026-07-22T11:00:00.000Z', '2026-07-20T10:00:00.000Z'),
  (o2, 'UL240702', buyer1_id, seller2_id, '[{"productId":"c0000000-0000-0000-0000-000000000009","title":"Giáo trình Nhập môn Lập trình Web","image":"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900","price":120000,"quantity":1}]', 15000, 0, 135000, 'in_transaction', 'cod', loc_order2, '', NULL, '2026-08-08T10:30:00.000Z'),
  (o3, 'UL240703', buyer1_id, seller1_id, '[{"productId":"c0000000-0000-0000-0000-000000000002","title":"Máy tính Casio FX-580VN X","image":"https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900","price":420000,"quantity":1}]', 0, 0, 420000, 'confirmed', 'meetup', loc_default, 'Hẹn gặp tại thư viện lúc 16:00.', NULL, '2026-08-09T08:15:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Saved Addresses
INSERT INTO saved_addresses (id, user_id, label, recipient, phone, province, district, ward, street, building, room, location_id, is_default, notes) VALUES
  (a1, buyer1_id, 'Ký túc xá', 'Phan Gia Bảo', '0342826430', 'Đồng Tháp', 'Thành phố Cao Lãnh', 'Phường Cao Lãnh', 'Phòng 405, Ký túc xá sinh viên', 'Ký túc xá Đại học Đồng Tháp', 'Phòng 405', loc_seller2, true, 'Gọi trước khi giao'),
  (a2, buyer1_id, 'Nhà riêng', 'Phan Gia Bảo', '0342826430', 'Đồng Tháp', 'Thành phố Cao Lãnh', 'Phường Cao Lãnh', '123 Đường Nguyễn Huệ', '', '', loc_order2, false, ''),
  (a3, buyer1_id, 'Văn phòng', 'Phan Gia Bảo', '0342826430', 'Đồng Tháp', 'Thành phố Cao Lãnh', 'Phường Cao Lãnh', 'Tòa nhà Thư viện', 'Trường Đại học Đồng Tháp', '', NULL, false, '')
ON CONFLICT (id) DO NOTHING;

-- Reviews
INSERT INTO reviews (id, order_id, author_id, product_id, rating, content, images, created_at) VALUES
  (r1, o1, buyer1_id, p1, 5, 'Sách đúng như mô tả, bạn bán nhiệt tình. Giao đúng hẹn.', '{}', '2026-07-23T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Chat Threads
INSERT INTO chat_threads (id, participant_1, participant_2, product_id, updated_at, created_at) VALUES
  (chat1, buyer1_id, seller2_id, p9, '2026-08-08T14:40:00.000Z', '2026-08-08T14:32:00.000Z'),
  (chat2, buyer1_id, seller1_id, p2, '2026-08-09T09:00:00.000Z', '2026-08-09T08:55:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Chat Messages (id la UUID hop le)
INSERT INTO chat_messages (id, thread_id, sender_id, text, read, offer_location_id, created_at) VALUES
  (m1, chat1, buyer1_id, 'Chào bạn, cuốn giáo trình này bạn còn giữ không?', true, NULL, '2026-08-08T14:32:00.000Z'),
  (m2, chat1, seller2_id, 'Sách vẫn còn nhé. Tình trạng còn khoảng 90%.', true, NULL, '2026-08-08T14:35:00.000Z'),
  (m3, chat1, buyer1_id, 'Tuyệt quá. Bạn có thể giao dịch ở trường chiều nay không?', true, NULL, '2026-08-08T14:36:00.000Z'),
  (m4, chat1, seller2_id, 'Được nha, mình chốt lịch này nhé:', true, loc_chat1, '2026-08-08T14:40:00.000Z'),
  (m5, chat2, buyer1_id, 'Máy còn bảo hành không bạn?', true, NULL, '2026-08-09T08:55:00.000Z'),
  (m6, chat2, seller1_id, 'Còn nha, mình bảo hành thêm 1 tháng.', false, NULL, '2026-08-09T09:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, type, title, body, icon, read, created_at) VALUES
  (n1, buyer1_id, 'order', 'Đơn hàng #UL240702 đã được giao thành công', 'Vui lòng xác nhận đã nhận hàng.', 'local_shipping', false, '2026-08-09T13:00:00.000Z'),
  (n2, buyer1_id, 'order', 'Đơn hàng #UL240703 đang được giao', 'Theo dõi lộ trình ngay.', 'local_shipping', true, '2026-08-08T14:30:00.000Z'),
  (n3, seller1_id, 'other', 'Tin đăng của bạn đã được duyệt', 'Sản phẩm đang được hiển thị.', 'campaign', true, '2026-08-06T09:00:00.000Z'),
  (n4, seller1_id, 'message', 'Phan Gia Bảo đã nhắn tin cho bạn', 'Máy còn bảo hành không bạn?', 'chat', true, '2026-08-05T16:20:00.000Z')
ON CONFLICT (id) DO NOTHING;

END $$;
