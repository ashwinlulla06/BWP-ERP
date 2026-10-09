CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  department    TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'admin')),
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  description  TEXT,
  category     TEXT    NOT NULL DEFAULT 'General',
  location     TEXT,
  asset_tag    TEXT    UNIQUE,
  image_url    TEXT,
  total_qty    INTEGER NOT NULL DEFAULT 1 CHECK (total_qty >= 0)
);

CREATE TABLE IF NOT EXISTS equipment_bookings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  equipment_id  INTEGER NOT NULL,
  date          TEXT    NOT NULL
                CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  time_slot     TEXT    NOT NULL
                CHECK (time_slot GLOB '[0-2][0-9]:[0-5][0-9]-[0-2][0-9]:[0-5][0-9]'),
  status        TEXT    NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  signature_hash TEXT,
  created_at    TEXT    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)      REFERENCES users(id)     ON DELETE RESTRICT,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS books (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  title   TEXT NOT NULL,
  author  TEXT,
  isbn    TEXT UNIQUE,
  status  TEXT NOT NULL DEFAULT 'available'
          CHECK (status IN ('available', 'reserved'))
);

CREATE TABLE IF NOT EXISTS book_reservations (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL,
  book_id        INTEGER NOT NULL,
  pickup_date    TEXT    NOT NULL
                 CHECK (pickup_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  status         TEXT    NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  signature_hash TEXT,
  created_at     TEXT    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_eq_bookings_slot ON equipment_bookings(equipment_id, date, time_slot);
CREATE INDEX IF NOT EXISTS idx_eq_bookings_user ON equipment_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON book_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book ON book_reservations(book_id);
