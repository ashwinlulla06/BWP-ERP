require("dotenv").config({ quiet: true });
const path = require("path");
const { get, run, initializeDatabase } = require("./config/db");
const { parseWithDOM } = require("./utils/xmlParser");

(async () => {
  await initializeDatabase(); // creates tables from models/schema.sql if missing
  const books = parseWithDOM(path.join(__dirname, "data", "books.xml"));

  let added = 0;
  for (const b of books) {
    if (!(await get("SELECT id FROM books WHERE isbn = ?", [b.isbn]))) {
      await run("INSERT INTO books (title, author, isbn, status) VALUES (?, ?, ?, ?)", [
        b.title,
        b.author,
        b.isbn,
        b.status,
      ]);
      added++;
    }
  }
  console.log(`Parsed ${books.length} books from XML, inserted ${added} new.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
