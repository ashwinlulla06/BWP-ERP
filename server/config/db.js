const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databasePath = path.resolve(
  __dirname,
  "..",
  process.env.DB_PATH || "data/unireserve.db"
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new sqlite3.Database(databasePath);

function run(sql, parameters = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, parameters, function handleResult(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, parameters = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, parameters, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function execute(sql) {
  return new Promise((resolve, reject) => {
    database.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, "..", "models", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await execute(schema);
}

module.exports = { database, get, initializeDatabase, run };
