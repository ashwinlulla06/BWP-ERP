const express = require("express");
 
const { database, get, run, all } = require("../config/db");
const authenticationRequired = require("../middleware/auth.middleware");
 
const router = express.Router();
router.use(authenticationRequired);
 
// Must match client/src/pages/equipment/lib/timeSlots.js
const SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];
const BOOKING_WINDOW_DAYS = 14; // today + the next 13 days
 
// ---- small helpers ---------------------------------------------------------
 
// node-sqlite3 has no promise API for "all rows", so wrap it here.
// Removed custom `all` to use the one from config/db.js which supports better-sqlite3
 
function send(response, status, data, message) {
  return response.status(status).json({ success: true, data, message });
}
 
function fail(response, status, message) {
  return response.status(status).json({ success: false, data: null, message });
}
 
const pad = (n) => String(n).padStart(2, "0");
 
function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
 
// Real calendar date in YYYY-MM-DD form (rejects 2026-02-31 and similar).
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
 
function slotStart(date, slot) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = slot.split("-")[0].split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0);
}
 
function parseId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0 ? Number(value) : null;
}
 
// One shape for every booking sent to the frontend.
// signature_hash is exposed as "signature"; created_at becomes a proper ISO string.
const BOOKING_SELECT = `
  SELECT b.id,
         b.equipment_id,
         e.name AS equipment_name,
         b.date,
         b.time_slot,
         b.status,
         b.signature_hash AS signature,
         replace(b.created_at, ' ', 'T') || 'Z' AS created_at
  FROM equipment_bookings b
  JOIN equipment e ON e.id = b.equipment_id`;
 
// ---- GET /api/equipment ----------------------------------------------------
 
router.get("/", async (request, response) => {
  const rows = await all(
    `SELECT id, name, description, category, location, asset_tag, image_url, total_qty
       FROM equipment
      ORDER BY category, name`
  );
  return send(response, 200, rows, "Equipment loaded.");
});
 
// ---- GET /api/equipment/my-bookings ---------------------------------------
// (declared before "/:id/slots" only for readability; the paths do not clash)
 
router.get("/my-bookings", async (request, response) => {
  const rows = await all(
    `${BOOKING_SELECT}
      WHERE b.user_id = ?
      ORDER BY b.date DESC, b.time_slot DESC, b.id DESC`,
    [request.auth.userId]
  );
  return send(response, 200, rows, "Bookings loaded.");
});
 
// ---- GET /api/equipment/:id/slots?date=YYYY-MM-DD --------------------------
// The real-time availability check the booking page calls.
 
router.get("/:id/slots", async (request, response) => {
  const equipmentId = parseId(request.params.id);
  if (!equipmentId) return fail(response, 404, "Equipment not found.");
 
  const date = request.query.date;
  if (!isValidDate(date)) {
    return fail(response, 400, "date must be a valid day in YYYY-MM-DD format.");
  }
 
  const equipment = await get("SELECT id, total_qty FROM equipment WHERE id = ?", [equipmentId]);
  if (!equipment) return fail(response, 404, "Equipment not found.");
 
  const rows = await all(
    `SELECT time_slot, COUNT(*) AS booked
       FROM equipment_bookings
      WHERE equipment_id = ? AND date = ? AND status IN ('pending', 'approved')
      GROUP BY time_slot`,
    [equipmentId, date]
  );
  const bookedBySlot = {};
  rows.forEach((row) => {
    bookedBySlot[row.time_slot] = row.booked;
  });
 
  const slots = SLOTS.map((time_slot) => {
    const booked = Math.min(bookedBySlot[time_slot] || 0, equipment.total_qty);
    const available = Math.max(equipment.total_qty - booked, 0);
    return {
      time_slot,
      total_qty: equipment.total_qty,
      booked_qty: booked,
      available_qty: available,
      is_available: available > 0,
    };
  });
 
  return send(response, 200, { equipment_id: equipment.id, date, slots }, "Availability loaded.");
});
 
// ---- POST /api/equipment/book ----------------------------------------------
// The frontend already checked availability, but another student may have booked
// in the meantime, so the server decides. Counting the bookings and inserting
// happen in ONE SQL statement, which SQLite runs atomically: two simultaneous
// requests can never both take the last unit.
 
router.post("/book", async (request, response) => {
  const body = request.body || {};
  const equipmentId = parseId(body.equipment_id);
  const { date, time_slot: timeSlot } = body;
 
  if (!equipmentId) return fail(response, 400, "equipment_id is required.");
  if (!isValidDate(date)) return fail(response, 400, "date must be a valid day in YYYY-MM-DD format.");
  if (!SLOTS.includes(timeSlot)) return fail(response, 400, "time_slot is not a valid slot.");
 
  const today = new Date();
  const todayISO = toISODate(today);
  const lastDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + BOOKING_WINDOW_DAYS - 1);
  if (date < todayISO) return fail(response, 400, "You cannot book a day that has already passed.");
  if (date > toISODate(lastDay)) {
    return fail(response, 400, `Bookings open up to ${BOOKING_WINDOW_DAYS} days ahead.`);
  }
  if (slotStart(date, timeSlot) <= today) {
    return fail(response, 400, "That time has already passed.");
  }
 
  const equipment = await get("SELECT id, total_qty FROM equipment WHERE id = ?", [equipmentId]);
  if (!equipment) return fail(response, 404, "Equipment not found.");
  if (equipment.total_qty < 1) {
    return fail(response, 409, "This equipment is currently out of service.");
  }
 
  const { generateSignature } = require("../utils/signature");
  const signature_hash = generateSignature({ user_id: request.auth.userId, equipment_id: equipmentId, date, time_slot: timeSlot });

  let result;
  try {
    result = await run(
      `INSERT INTO equipment_bookings (user_id, equipment_id, date, time_slot, status, signature_hash)
       SELECT ?, e.id, ?, ?, 'pending', ?
         FROM equipment e
        WHERE e.id = ?
          AND (SELECT COUNT(*)
                 FROM equipment_bookings b
                WHERE b.equipment_id = e.id
                  AND b.date = ?
                  AND b.time_slot = ?
                  AND b.status IN ('pending', 'approved')) < e.total_qty`,
      [request.auth.userId, date, timeSlot, signature_hash, equipmentId, date, timeSlot]
    );
  } catch (error) {
    // The unique index stops one person holding two active bookings for a slot.
    if (error && error.code === "SQLITE_CONSTRAINT" && /UNIQUE/i.test(error.message)) {
      return fail(response, 409, "You already have a booking for this slot.");
    }
    throw error;
  }
 
  if (result.changes === 0) {
    // Nothing was inserted. Either this user already holds the slot, or it is full.
    const mine = await get(
      `SELECT id FROM equipment_bookings
        WHERE user_id = ? AND equipment_id = ? AND date = ? AND time_slot = ?
          AND status IN ('pending', 'approved')`,
      [request.auth.userId, equipmentId, date, timeSlot]
    );
    if (mine) return fail(response, 409, "You already have a booking for this slot.");
    return fail(response, 409, "This slot was just booked by someone else.");
  }
 
  const booking = await get(`${BOOKING_SELECT} WHERE b.id = ?`, [result.id]);
  return send(response, 201, booking, "Booking request sent for approval.");
});
 
// ---- DELETE /api/equipment/booking/:id -------------------------------------
 
router.delete("/booking/:id", async (request, response) => {
  const bookingId = parseId(request.params.id);
  if (!bookingId) return fail(response, 404, "Booking not found.");
 
  // Filtering on user_id means nobody can cancel (or even detect) someone else's booking.
  const booking = await get(
    "SELECT id, status, date, time_slot FROM equipment_bookings WHERE id = ? AND user_id = ?",
    [bookingId, request.auth.userId]
  );
  if (!booking) return fail(response, 404, "Booking not found.");
 
  if (booking.status !== "pending" && booking.status !== "approved") {
    return fail(response, 409, `This booking is already ${booking.status}.`);
  }
  if (slotStart(booking.date, booking.time_slot) <= new Date()) {
    return fail(response, 400, "This slot has already started and can no longer be cancelled.");
  }
 
  const result = await run(
    `UPDATE equipment_bookings
        SET status = 'cancelled'
      WHERE id = ? AND user_id = ? AND status IN ('pending', 'approved')`,
    [bookingId, request.auth.userId]
  );
  if (result.changes === 0) {
    return fail(response, 409, "This booking can no longer be cancelled.");
  }
 
  return send(response, 200, { id: bookingId, status: "cancelled" }, "Booking cancelled.");
});
 
module.exports = router;