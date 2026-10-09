const express = require("express");
const db = require("../config/db");
const router = express.Router();

// TEMP until Person 1's auth middleware exists. Then use req.user.id only.
const getUserId = (req) =>
  req.user ? req.user.id : Number(req.body?.user_id || req.query.user_id);

const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s));

// Search books (returns everything when no search term)
router.get("/", (req, res) => {
  const q = `%${req.query.search || ""}%`;
  const rows = db
    .prepare("SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY title")
    .all(q, q);
  res.json(rows);
});

// List this user's reservations (for MyReservations.js)
router.get("/reservations", (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.id, r.pickup_date, r.status, b.title, b.author
       FROM book_reservations r
       JOIN books b ON b.id = r.book_id
       WHERE r.user_id = ?
       ORDER BY r.id DESC`
    )
    .all(getUserId(req));
  res.json(rows);
});

// Reserve a book
router.post("/reserve", (req, res) => {
  const userId = getUserId(req);
  const { book_id, pickup_date } = req.body;

  if (!userId || !book_id || !pickup_date) {
    return res.status(400).json({ error: "user_id, book_id and pickup_date are required" });
  }
  if (!isValidDate(pickup_date)) {
    return res.status(400).json({ error: "pickup_date must be in YYYY-MM-DD format" });
  }
  if (pickup_date < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({ error: "Pickup date cannot be in the past" });
  }

  // Transaction: check + insert + status update succeed or fail together
  const reserve = db.transaction(() => {
    const book = db.prepare("SELECT status FROM books WHERE id = ?").get(book_id);
    if (!book) return { code: 404, body: { error: "Book not found" } };
    if (book.status !== "available") {
      return { code: 409, body: { error: "Book is already reserved" } };
    }
    const info = db
      .prepare("INSERT INTO book_reservations (user_id, book_id, pickup_date) VALUES (?, ?, ?)")
      .run(userId, book_id, pickup_date);
    db.prepare("UPDATE books SET status = 'reserved' WHERE id = ?").run(book_id);
    return { code: 201, body: { id: info.lastInsertRowid, status: "pending" } };
  });

  try {
    const result = reserve();
    res.status(result.code).json(result.body);
  } catch (e) {
    if (String(e.message).includes("FOREIGN KEY")) {
      return res.status(400).json({ error: "User does not exist" });
    }
    res.status(500).json({ error: "Could not create reservation" });
  }
});

// Cancel a reservation (keeps the row as history, frees the book)
router.delete("/reservation/:id", (req, res) => {
  const userId = getUserId(req);

  const cancel = db.transaction(() => {
    const r = db
      .prepare("SELECT * FROM book_reservations WHERE id = ? AND user_id = ?")
      .get(req.params.id, userId);
    if (!r) return { code: 404, body: { error: "Reservation not found" } };
    if (!["pending", "approved"].includes(r.status)) {
      return { code: 409, body: { error: `Reservation is already ${r.status}` } };
    }
    db.prepare("UPDATE book_reservations SET status = 'cancelled' WHERE id = ?").run(r.id);
    db.prepare("UPDATE books SET status = 'available' WHERE id = ?").run(r.book_id);
    return { code: 200, body: { ok: true } };
  });

  try {
    const result = cancel();
    res.status(result.code).json(result.body);
  } catch (e) {
    res.status(500).json({ error: "Could not cancel reservation" });
  }
});

module.exports = router;
