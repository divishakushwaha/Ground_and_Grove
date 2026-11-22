-- Grounds and Grooves: SQLite schema (runs automatically when the server starts)

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT    NOT NULL,
  phone         TEXT    NOT NULL,
  order_type    TEXT    NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
  notes         TEXT,
  total         REAL    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'Received',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id  INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT    NOT NULL,
  price     REAL    NOT NULL,
  quantity  INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS reservations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  contact    TEXT    NOT NULL,
  date       TEXT    NOT NULL,   -- YYYY-MM-DD
  time       TEXT    NOT NULL,   -- HH:MM
  guests     INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 20),
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS feedback (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL DEFAULT 'Anonymous',
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
