require("dotenv").config({ quiet: true });
const path = require("path");
const { get, run, initializeDatabase } = require("./config/db");
const { parseWithDOM } = require("./utils/xmlParser");

(async () => {
  await initializeDatabase(); // creates tables from models/schema.sql if missing
  const books = parseWithDOM(path.join(__dirname, "data", "books.xml"));

  let added = 0;
  for (const b of books) {
    const existing = await get("SELECT id FROM books WHERE isbn = ?", [b.isbn]);
    if (!existing) {
      await run("INSERT INTO books (title, author, isbn, call_number, status) VALUES (?, ?, ?, ?, ?)", [
        b.title,
        b.author,
        b.isbn,
        b.call_number,
        b.status,
      ]);
      added++;
    } else if (b.call_number) {
      await run("UPDATE books SET call_number = ? WHERE id = ? AND (call_number IS NULL OR call_number = '')", [
        b.call_number,
        existing.id,
      ]);
    }
  }
  console.log(`Parsed ${books.length} books from XML, inserted ${added} new.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
