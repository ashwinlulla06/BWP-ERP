const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { get, run } = require("../config/db");
const authenticationRequired = require("../middleware/auth.middleware");

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_ROLES = new Set(["student", "faculty"]);
const SAFE_USER_COLUMNS = "id, name, email, department, role, created_at, updated_at";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRegistration(body) {
  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const department = text(body.department);
  const role = text(body.role).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!name || !department) return { error: "Name and department are required." };
  if (name.length > 100 || department.length > 100) {
    return { error: "Name and department must be 100 characters or fewer." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }
  if (!PUBLIC_ROLES.has(role)) {
    return { error: "Role must be student or faculty." };
  }
  if (password.length < 6) {
    return { error: "Password must contain at least 6 characters." };
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    return { error: "Password must be 72 bytes or fewer." };
  }
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  return { name, email, department, role, password };
}

function signToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1d",
    subject: String(userId),
  });
}

router.post("/register", async (request, response, next) => {
  try {
    const input = validateRegistration(request.body || {});
    if (input.error) {
      return response.status(400).json({ success: false, data: null, message: input.error });
    }

    const existingUser = await get("SELECT id FROM users WHERE email = ?", [input.email]);
    if (existingUser) {
      return response.status(409).json({
        success: false,
        data: null,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    let result;
    try {
      result = await run(
        `INSERT INTO users (name, email, department, role, password_hash)
         VALUES (?, ?, ?, ?, ?)`,
        [input.name, input.email, input.department, input.role, passwordHash]
      );
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT") {
        return response.status(409).json({
          success: false,
          data: null,
          message: "An account with this email already exists.",
        });
      }
      throw error;
    }

    const user = await get(`SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = ?`, [result.id]);
    return response.status(201).json({
      success: true,
      data: { token: signToken(user.id), user },
      message: "Account created successfully.",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const email = text(request.body?.email).toLowerCase();
    const password = typeof request.body?.password === "string" ? request.body.password : "";

    if (!EMAIL_PATTERN.test(email) || !password) {
      return response.status(400).json({
        success: false,
        data: null,
        message: "A valid email and password are required.",
      });
    }

    const account = await get("SELECT * FROM users WHERE email = ?", [email]);
    const passwordMatches = account
      ? await bcrypt.compare(password, account.password_hash)
      : false;

    if (!account || !passwordMatches) {
      return response.status(401).json({
        success: false,
        data: null,
        message: "Invalid email or password.",
      });
    }

    const user = await get(`SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = ?`, [account.id]);
    return response.json({
      success: true,
      data: { token: signToken(user.id), user },
      message: "Login successful.",
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticationRequired, async (request, response, next) => {
  try {
    const user = await get(`SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = ?`, [
      request.auth.userId,
    ]);

    if (!user) {
      return response.status(404).json({
        success: false,
        data: null,
        message: "User account not found.",
      });
    }

    return response.json({
      success: true,
      data: { user },
      message: "Profile retrieved successfully.",
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
