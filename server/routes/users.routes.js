const express = require("express");

const { get, run } = require("../config/db");
const authenticationRequired = require("../middleware/auth.middleware");

const router = express.Router();
const SAFE_USER_COLUMNS = "id, name, email, department, role, created_at, updated_at";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

router.put("/profile", authenticationRequired, async (request, response, next) => {
  try {
    const protectedFields = ["id", "email", "role", "password", "password_hash"];
    if (protectedFields.some((field) => Object.hasOwn(request.body || {}, field))) {
      return response.status(400).json({
        success: false,
        data: null,
        message: "Only name and department can be updated.",
      });
    }

    const currentUser = await get("SELECT id, name, department FROM users WHERE id = ?", [
      request.auth.userId,
    ]);
    if (!currentUser) {
      return response.status(404).json({
        success: false,
        data: null,
        message: "User account not found.",
      });
    }

    const name = Object.hasOwn(request.body || {}, "name")
      ? text(request.body.name)
      : currentUser.name;
    const department = Object.hasOwn(request.body || {}, "department")
      ? text(request.body.department)
      : currentUser.department;

    if (!name || !department) {
      return response.status(400).json({
        success: false,
        data: null,
        message: "Name and department cannot be empty.",
      });
    }
    if (name.length > 100 || department.length > 100) {
      return response.status(400).json({
        success: false,
        data: null,
        message: "Name and department must be 100 characters or fewer.",
      });
    }

    await run(
      `UPDATE users
       SET name = ?, department = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, department, request.auth.userId]
    );

    const user = await get(`SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = ?`, [
      request.auth.userId,
    ]);
    return response.json({
      success: true,
      data: { user },
      message: "Profile updated successfully.",
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
