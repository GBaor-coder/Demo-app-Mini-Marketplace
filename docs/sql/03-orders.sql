-- BANG 3: orders
CREATE TABLE IF NOT EXISTS orders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code             TEXT NOT NULL UNIQUE,
  buyer_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items                  JSONB NOT NULL DEFAULT '[]',
  shipping_fee           INTEGER NOT NULL DEFAULT 0,
  platform_fee           INTEGER NOT NULL DEFAULT 0,
  total                  INTEGER NOT NULL DEFAULT 0,
  status                 TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_transaction', 'completed', 'cancelled', 'rejected'
  )),
  delivery_method        TEXT NOT NULL DEFAULT 'meetup' CHECK (delivery_method IN ('meetup', 'cod')),
  delivery_location_id   UUID REFERENCES locations(id) ON DELETE SET NULL,
  note                   TEXT NOT NULL DEFAULT '',
  cancel_reason          TEXT DEFAULT NULL,
  cancelled_at           TIMESTAMPTZ DEFAULT NULL,
  completed_at           TIMESTAMPTZ DEFAULT NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
