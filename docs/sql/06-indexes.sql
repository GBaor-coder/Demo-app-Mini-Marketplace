-- INDEXES
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
