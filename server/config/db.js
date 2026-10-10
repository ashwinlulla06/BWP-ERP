const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const databasePath = path.resolve(
  __dirname,
  "..",
  process.env.DB_PATH || "data/unireserve.db"
);

// Ensure the database directory exists
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

// Initialize database with better-sqlite3
const database = new Database(databasePath, { verbose: console.log });

// Enable foreign keys
database.pragma("foreign_keys = ON");

// Wrappers to keep the old API signature, adapted for better-sqlite3
function run(sql, parameters = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = database.prepare(sql);
      const info = stmt.run(parameters);
      resolve({ id: info.lastInsertRowid, changes: info.changes });
    } catch (error) {
      reject(error);
    }
  });
}

function get(sql, parameters = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = database.prepare(sql);
      const row = stmt.get(parameters);
      resolve(row);
    } catch (error) {
      reject(error);
    }
  });
}

function all(sql, parameters = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = database.prepare(sql);
      const rows = stmt.all(parameters);
      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
}

function execute(sql) {
  return new Promise((resolve, reject) => {
    try {
      database.exec(sql);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, "..", "models", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await execute(schema);
  console.log("Database initialized from schema.");
}

module.exports = { database, get, all, initializeDatabase, run };
