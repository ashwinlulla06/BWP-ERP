CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  department TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL,
  equipment_id   INTEGER NOT NULL,
  date           TEXT    NOT NULL
                 CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  time_slot      TEXT    NOT NULL
                 CHECK (time_slot GLOB '[0-2][0-9]:[0-5][0-9]-[0-2][0-9]:[0-5][0-9]'),
  status         TEXT    NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  signature_hash TEXT,
  created_at     TEXT    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)      REFERENCES users(id)     ON DELETE RESTRICT,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT
);
 
-- Fast availability check for one item, date and slot
CREATE INDEX IF NOT EXISTS idx_eq_bookings_slot
  ON equipment_bookings (equipment_id, date, time_slot);
 
-- Fast "My Bookings" lookup
CREATE INDEX IF NOT EXISTS idx_eq_bookings_user
  ON equipment_bookings (user_id);
 
-- One person cannot hold two active bookings for the same item, date and slot.
-- Cancelled and rejected rows are ignored, so re-booking after cancelling works.
CREATE UNIQUE INDEX IF NOT EXISTS uq_eq_bookings_user_slot_active
  ON equipment_bookings (user_id, equipment_id, date, time_slot)
  WHERE status IN ('pending', 'approved');
 
-- Sample equipment. Inserted only while the table is empty, so equipment an
-- admin adds or deletes later is never overwritten when the server restarts.
WITH seed (name, description, category, location, asset_tag, total_qty) AS (
  VALUES
    ('Digital Oscilloscope 100MHz', 'Keysight DSOX1204G with 4 analogue channels and built-in function generator.', 'Electronics', 'Electronics Lab 204', 'EQ-KEYSIGHT-100M', 4),
    ('Arduino & Sensor Kit', 'Mega 2560 boards with temperature, ultrasonic and IMU sensor modules.', 'Electronics', 'Electronics Lab 204', 'EQ-ARD-MEGA', 10),
    ('Trinocular Microscope', 'Olympus CX23 with 4x to 100x objectives and camera port.', 'Bio-Optics', 'Bio Lab 112', 'EQ-OLY-CX23', 3),
    ('UV-Vis Spectrophotometer', 'Wavelength range 190 to 1100 nm for absorbance and kinetics studies.', 'Bio-Optics', 'Bio Lab 115', 'EQ-UVVIS-02', 2),
    ('6-Axis Robotic Arm', 'Desktop arm with 500 g payload, programmable in Python and ROS.', 'Robotics', 'Robotics Arena, Bay 3', 'EQ-ARM-6X', 2),
    ('FPGA Development Board', 'Xilinx Artix-7 board with VGA, HDMI and 100 MHz clock.', 'Electronics', 'VLSI Lab 301', 'EQ-FPGA-A7', 6),
    ('Laser Alignment Station', 'Class 3B optical bench with mounts, mirrors and power meter.', 'Photonics', 'Cleanroom 02', 'EQ-LASER-3B', 1),
    ('3D Printer (FDM)', 'Prusa i3 MK3S+ with PLA and PETG filament, 25 x 21 x 21 cm bed.', 'Robotics', 'Maker Space', 'EQ-3DP-MK3', 3)
)
INSERT INTO equipment (name, description, category, location, asset_tag, total_qty)
SELECT name, description, category, location, asset_tag, total_qty
  FROM seed
 WHERE NOT EXISTS (SELECT 1 FROM equipment);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
         CHECK (status IN ('available', 'reserved'))
);

CREATE TABLE IF NOT EXISTS book_reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  pickup_date TEXT NOT NULL
              CHECK (pickup_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  status TEXT NOT NULL DEFAULT 'pending'
         CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  signature_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT
);