const express = require("express");
const { database, get, run } = require("../config/db");
const authenticationRequired = require("../middleware/auth.middleware");

const router = express.Router();

// Every books endpoint needs a logged-in user. The middleware verifies the
// Bearer token and sets request.auth.userId, so the client never sends a user id.
router.use(authenticationRequired);

// Same response shape as the rest of the API: { success, data, message }
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, status, message) =>
  res.status(status).json({ success: false, data: null, message });

// db.js has get() and run() but no "all", so wrap database.all here.
const all = (sql, params = []) =>
  new Promise((resolve, reject) =>
    database.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s));

// Search books (returns everything when no search term)
router.get("/", async (req, res) => {
  try {
    const q = `%${req.query.search || ""}%`;
    const rows = await all(
      "SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY title",
      [q, q]
    );
    ok(res, rows);
  } catch (e) {
    fail(res, 500, "Could not load books.");
  }
});

// This user's reservations (for the My Reservations page)
router.get("/reservations", async (req, res) => {
  try {
    const rows = await all(
      `SELECT r.id, r.pickup_date, r.status, b.title, b.author
       FROM book_reservations r
       JOIN books b ON b.id = r.book_id
       WHERE r.user_id = ?
       ORDER BY r.id DESC`,
      [req.auth.userId]
    );
    ok(res, rows);
  } catch (e) {
    fail(res, 500, "Could not load reservations.");
  }
});

// Reserve a book
router.post("/reserve", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { book_id, pickup_date } = req.body || {};

    if (!Number.isInteger(Number(book_id)) || !pickup_date) {
      return fail(res, 400, "book_id and pickup_date are required.");
    }
    if (!isValidDate(pickup_date)) {
      return fail(res, 400, "pickup_date must be in YYYY-MM-DD format.");
    }
    if (pickup_date < new Date().toISOString().slice(0, 10)) {
      return fail(res, 400, "Pickup date cannot be in the past.");
    }
    if (!(await get("SELECT id FROM users WHERE id = ?", [userId]))) {
      return fail(res, 401, "Your account no longer exists.");
    }

    // Atomic claim: this single UPDATE only succeeds for ONE request, even if
    // several arrive at the same moment. (No BEGIN/COMMIT needed, which matters
    // because the team shares one sqlite3 connection.)
    const claim = await run(
      "UPDATE books SET status = 'reserved' WHERE id = ? AND status = 'available'",
      [book_id]
    );
    if (claim.changes === 0) {
      const exists = await get("SELECT id FROM books WHERE id = ?", [book_id]);
      return exists
        ? fail(res, 409, "This book is already reserved.")
        : fail(res, 404, "Book not found.");
    }

    try {
      const info = await run(
        "INSERT INTO book_reservations (user_id, book_id, pickup_date) VALUES (?, ?, ?)",
        [userId, book_id, pickup_date]
      );
      ok(res, { id: info.id, status: "pending" }, 201);
    } catch (e) {
      // Insert failed after we claimed the book: release it again.
      await run("UPDATE books SET status = 'available' WHERE id = ?", [book_id]);
      throw e;
    }
  } catch (e) {
    fail(res, 500, "Could not create the reservation.");
  }
});

// Cancel a reservation (keeps the row as history, frees the book)
router.delete("/reservation/:id", async (req, res) => {
  try {
    const r = await get("SELECT * FROM book_reservations WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.auth.userId,
    ]);
    if (!r) return fail(res, 404, "Reservation not found.");
    if (!["pending", "approved"].includes(r.status)) {
      return fail(res, 409, `This reservation is already ${r.status}.`);
    }

    const upd = await run(
      "UPDATE book_reservations SET status = 'cancelled' WHERE id = ? AND status IN ('pending','approved')",
      [r.id]
    );
    if (upd.changes === 0) return fail(res, 409, "This reservation was already changed.");

    await run("UPDATE books SET status = 'available' WHERE id = ?", [r.book_id]);
    ok(res, { cancelled: true });
  } catch (e) {
    fail(res, 500, "Could not cancel the reservation.");
  }
});

module.exports = router;
