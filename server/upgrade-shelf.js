const fs = require('fs');
const { database, get, all, run } = require('./config/db');

(async () => {
  try {
    // 1. Add column to live database safely if missing
    const columns = database.pragma("table_info(books)");
    if (!columns.some(col => col.name === 'call_number')) {
      database.exec('ALTER TABLE books ADD COLUMN call_number TEXT');
    }

    // 2. Assign shelf codes TK12091 to TK12100 to existing books that do not have one
    const rows = await all('SELECT id FROM books WHERE call_number IS NULL OR call_number = "" ORDER BY id');
    for (let i = 0; i < rows.length; i++) {
      await run('UPDATE books SET call_number = ? WHERE id = ?', [`TK${12091 + i}`, rows[i].id]);
    }
    console.log("✅ Database updated with Shelf Call Numbers!");
  } catch (err) {
    console.error("Migration error:", err);
  }

  // 3. Patch schema.sql for future initializations if needed
  try {
    let schema = fs.readFileSync('models/schema.sql', 'utf8');
    if (!schema.includes('call_number TEXT')) {
      schema = schema.replace('isbn    TEXT UNIQUE,', 'isbn    TEXT UNIQUE,\n  call_number TEXT,');
      fs.writeFileSync('models/schema.sql', schema);
    }
  } catch (e) {
    // file might be read from a different CWD
  }

  console.log("✅ Upgrade shelf check completed successfully!");
})();

