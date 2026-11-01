CREATE TABLE products (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at BIGINT NOT NULL
);
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  items TEXT NOT NULL,
  method TEXT NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  ip_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE INDEX orders_ip_created_idx ON orders (ip_hash, created_at);
CREATE INDEX orders_created_idx ON orders (created_at DESC);
