const db = require("./config/db");

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all();
console.log("Tables:", tables.length ? tables.map((t) => t.name).join(", ") : "(none yet)");

for (const t of tables) {
  const n = db.prepare(`SELECT COUNT(*) AS n FROM ${t.name}`).get().n;
  console.log(`  ${t.name}: ${n} rows`);
}
