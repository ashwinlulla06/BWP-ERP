const express = require("express");
const { database, get, all, run } = require("../config/db");
const authenticationRequired = require("../middleware/auth.middleware");

const router = express.Router();

// Only allow admins
router.use(authenticationRequired);
router.use(async (req, res, next) => {
  try {
    const user = await get("SELECT role FROM users WHERE id = ?", [req.auth.userId]);
    if (!user || (user.role !== "admin" && user.role !== "faculty")) {
      return res.status(403).json({ success: false, data: null, message: "Admin access required." });
    }
    req.auth.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
});

function send(response, status, data, message) {
  return response.status(status).json({ success: true, data, message });
}

function fail(response, status, message) {
  return response.status(status).json({ success: false, data: null, message });
}

function parseId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0 ? Number(value) : null;
}

// ---- GET /api/admin/reservations ----------------------------------------------------

router.get("/reservations", async (req, res) => {
  try {
    const equipmentBookings = await all(`
      SELECT 
        b.id,
        u.name as user,
        'Equipment' as type,
        e.name as resource,
        b.date,
        b.time_slot as time,
        b.status
      FROM equipment_bookings b
      JOIN users u ON b.user_id = u.id
      JOIN equipment e ON b.equipment_id = e.id
      ORDER BY b.created_at DESC
    `);

    const bookReservations = await all(`
      SELECT 
        r.id,
        u.name as user,
        'Library Book' as type,
        b.title as resource,
        r.pickup_date as date,
        'Pickup by 5:00 PM' as time,
        r.status
      FROM book_reservations r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      ORDER BY r.created_at DESC
    `);

    const reservations = [...equipmentBookings, ...bookReservations].sort((a, b) => {
      return a.id > b.id ? -1 : 1;
    });

    return send(res, 200, reservations, "Reservations loaded.");
  } catch (error) {
    console.error("GET /admin/reservations error:", error);
    return fail(res, 500, "Error loading reservations.");
  }
});

// ---- POST /api/admin/reservations/:type/:id/:action ---------------------------------

router.post("/reservations/:type/:id/:action", async (req, res) => {
  const { type, id, action } = req.params;
  const resourceId = parseId(id);

  if (!resourceId) return fail(res, 400, "Invalid ID.");
  if (!['approve', 'reject'].includes(action)) return fail(res, 400, "Invalid action.");

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  
  try {
    if (type === 'equipment') {
      const result = await run(
        "UPDATE equipment_bookings SET status = ? WHERE id = ? AND status = 'pending'",
        [newStatus, resourceId]
      );
      if (result.changes === 0) return fail(res, 400, "Booking not found or already processed.");
      return send(res, 200, { id: resourceId, status: newStatus }, "Equipment booking updated.");
    } else if (type === 'book') {
      const result = await run(
        "UPDATE book_reservations SET status = ? WHERE id = ? AND status = 'pending'",
        [newStatus, resourceId]
      );
      if (result.changes === 0) return fail(res, 400, "Reservation not found or already processed.");
      
      if (action === 'approve') {
        const r = await get("SELECT book_id FROM book_reservations WHERE id = ?", [resourceId]);
        await run("UPDATE books SET status = 'reserved' WHERE id = ?", [r.book_id]);
      }
      
      return send(res, 200, { id: resourceId, status: newStatus }, "Book reservation updated.");
    } else {
      return fail(res, 400, "Invalid type. Use 'equipment' or 'book'.");
    }
  } catch (error) {
    console.error("POST /admin/reservations error:", error);
    return fail(res, 500, "Error updating reservation.");
  }
});

// ---- EQUIPMENT CRUD ----------------------------------------------------

router.post("/equipment", async (req, res) => {
  const { name, description, category, location, asset_tag, total_qty } = req.body;
  if (!name || total_qty == null) return fail(res, 400, "Name and total_qty are required.");

  try {
    const result = await run(
      "INSERT INTO equipment (name, description, category, location, asset_tag, total_qty) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, category || 'General', location, asset_tag, total_qty]
    );
    return send(res, 201, { id: result.id }, "Equipment added.");
  } catch (error) {
    console.error("POST /admin/equipment error:", error);
    if (error.code === 'SQLITE_CONSTRAINT') return fail(res, 409, "Asset tag must be unique.");
    return fail(res, 500, "Error adding equipment.");
  }
});

router.put("/equipment/:id", async (req, res) => {
  const equipmentId = parseId(req.params.id);
  if (!equipmentId) return fail(res, 400, "Invalid ID.");

  const { name, description, category, location, asset_tag, total_qty } = req.body;
  
  try {
    const result = await run(
      "UPDATE equipment SET name = ?, description = ?, category = ?, location = ?, asset_tag = ?, total_qty = ? WHERE id = ?",
      [name, description, category, location, asset_tag, total_qty, equipmentId]
    );
    if (result.changes === 0) return fail(res, 404, "Equipment not found.");
    return send(res, 200, { id: equipmentId }, "Equipment updated.");
  } catch (error) {
    console.error("PUT /admin/equipment error:", error);
    return fail(res, 500, "Error updating equipment.");
  }
});

router.delete("/equipment/:id", async (req, res) => {
  const equipmentId = parseId(req.params.id);
  if (!equipmentId) return fail(res, 400, "Invalid ID.");

  try {
    const result = await run("DELETE FROM equipment WHERE id = ?", [equipmentId]);
    if (result.changes === 0) return fail(res, 404, "Equipment not found.");
    return send(res, 200, { id: equipmentId }, "Equipment deleted.");
  } catch (error) {
    console.error("DELETE /admin/equipment error:", error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return fail(res, 409, "Cannot delete equipment because it has active bookings.");
    }
    return fail(res, 500, "Error deleting equipment.");
  }
});

// ---- BOOKS CRUD ----------------------------------------------------

router.post("/books", async (req, res) => {
  const { title, author, isbn, status } = req.body;
  if (!title || !author || !isbn) return fail(res, 400, "Title, author, and isbn are required.");

  try {
    const result = await run(
      "INSERT INTO books (title, author, isbn, status) VALUES (?, ?, ?, ?)",
      [title, author, isbn, status || 'available']
    );
    return send(res, 201, { id: result.id }, "Book added.");
  } catch (error) {
    console.error("POST /admin/books error:", error);
    if (error.code === 'SQLITE_CONSTRAINT') return fail(res, 409, "ISBN must be unique.");
    return fail(res, 500, "Error adding book.");
  }
});

router.put("/books/:id", async (req, res) => {
  const bookId = parseId(req.params.id);
  if (!bookId) return fail(res, 400, "Invalid ID.");

  const { title, author, isbn, status } = req.body;
  
  try {
    const result = await run(
      "UPDATE books SET title = ?, author = ?, isbn = ?, status = ? WHERE id = ?",
      [title, author, isbn, status, bookId]
    );
    if (result.changes === 0) return fail(res, 404, "Book not found.");
    return send(res, 200, { id: bookId }, "Book updated.");
  } catch (error) {
    console.error("PUT /admin/books error:", error);
    return fail(res, 500, "Error updating book.");
  }
});

router.delete("/books/:id", async (req, res) => {
  const bookId = parseId(req.params.id);
  if (!bookId) return fail(res, 400, "Invalid ID.");

  try {
    const result = await run("DELETE FROM books WHERE id = ?", [bookId]);
    if (result.changes === 0) return fail(res, 404, "Book not found.");
    return send(res, 200, { id: bookId }, "Book deleted.");
  } catch (error) {
    console.error("DELETE /admin/books error:", error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return fail(res, 409, "Cannot delete book because it has active reservations.");
    }
    return fail(res, 500, "Error deleting book.");
  }
});

// ---- REPORTS -----------------------------------------------------------

router.get("/reports", async (req, res) => {
  const { from, to, type } = req.query;
  
  if (!from || !to) {
    return fail(res, 400, "from and to dates are required.");
  }

  let equipmentQuery = "";
  let booksQuery = "";
  let parameters = [];

  const equipmentSql = `
    SELECT 
      b.id,
      u.name as user,
      'Equipment' as type,
      e.name as resource,
      b.date,
      b.status
    FROM equipment_bookings b
    JOIN users u ON b.user_id = u.id
    JOIN equipment e ON b.equipment_id = e.id
    WHERE b.date >= ? AND b.date <= ?
  `;

  const booksSql = `
    SELECT 
      r.id,
      u.name as user,
      'Library Book' as type,
      b.title as resource,
      r.pickup_date as date,
      r.status
    FROM book_reservations r
    JOIN users u ON r.user_id = u.id
    JOIN books b ON r.book_id = b.id
    WHERE r.pickup_date >= ? AND r.pickup_date <= ?
  `;

  let reservations = [];

  try {
    if (!type || type === "All Bookings") {
      const eqRows = await all(equipmentSql, [from, to]);
      const bkRows = await all(booksSql, [from, to]);
      reservations = [...eqRows, ...bkRows];
    } else if (type === "Equipment Usage") {
      reservations = await all(equipmentSql, [from, to]);
    } else if (type === "Library Checkout") {
      reservations = await all(booksSql, [from, to]);
    }
    
    reservations.sort((a, b) => a.date > b.date ? 1 : -1);

    const { generateReportHtml } = require("../utils/xsltReport");
    const html = generateReportHtml(reservations, type || "All Bookings");

    return send(res, 200, { html }, "Report generated successfully.");
  } catch (error) {
    console.error("GET /admin/reports error:", error);
    return fail(res, 500, "Error generating report.");
  }
});

module.exports = router;
