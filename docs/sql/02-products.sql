-- BANG 2: products
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
