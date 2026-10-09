const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
  process.env.DB_PATH || path.join(__dirname, "..", "database.sqlite")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

module.exports = db;
