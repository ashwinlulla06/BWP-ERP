const express = require("express");
const { database, get, all, run } = require("../config/db");
const authenticationRequired = require("../middleware/auth.middleware");

const router = express.Router();

function send(response, status, data, message) {
  return response.status(status).json({ success: true, data, message });
}

function fail(response, status, message) {
  return response.status(status).json({ success: false, data: null, message });
}

function parseId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0 ? Number(value) : null;
}

// ---- GET /api/books ----------------------------------------------------

router.get("/", async (req, res) => {
  try {
    const rows = await all("SELECT id, title, author, isbn, status FROM books ORDER BY title");
    return send(res, 200, rows, "Books loaded.");
  } catch (error) {
    console.error("GET /books error:", error);
    return fail(res, 500, "Error loading books.");
  }
});

// Require authentication for reservations
router.use(authenticationRequired);

// ---- POST /api/books/reserve -------------------------------------------

router.post("/reserve", async (req, res) => {
  const { book_id, pickup_date } = req.body;
  const bookId = parseId(book_id);

  if (!bookId) return fail(res, 400, "book_id is required.");
  if (!pickup_date || !/^\d{4}-\d{2}-\d{2}$/.test(pickup_date)) {
    return fail(res, 400, "pickup_date must be a valid YYYY-MM-DD.");
  }

  const book = await get("SELECT id, status FROM books WHERE id = ?", [bookId]);
  if (!book) return fail(res, 404, "Book not found.");
  if (book.status !== "available") return fail(res, 409, "Book is currently reserved or not available.");

  const { generateSignature } = require("../utils/signature");
  const signature_hash = generateSignature({ user_id: req.auth.userId, book_id: bookId, pickup_date });

  try {
    const result = await run(
      "INSERT INTO book_reservations (user_id, book_id, pickup_date, status, signature_hash) VALUES (?, ?, ?, 'pending', ?)",
      [req.auth.userId, bookId, pickup_date, signature_hash]
    );
    return send(res, 201, { id: result.id, signature: signature_hash }, "Book reservation requested.");
  } catch (error) {
    console.error("POST /books/reserve error:", error);
    return fail(res, 500, "Error creating reservation.");
  }
});

module.exports = router;
