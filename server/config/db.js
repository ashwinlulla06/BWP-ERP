const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "unireserve.db");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const database = new sqlite3.Database(dbPath);

// Enable foreign key constraints
database.run("PRAGMA foreign_keys = ON");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function initializeDatabase() {
  const schemaPath = path.join(__dirname, "..", "models", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  return new Promise((resolve, reject) => {
    database.exec(schema, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { database, get, run, all, initializeDatabase };
