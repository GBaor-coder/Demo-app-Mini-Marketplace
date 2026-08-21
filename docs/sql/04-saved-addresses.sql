-- BANG 4: saved_addresses
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
