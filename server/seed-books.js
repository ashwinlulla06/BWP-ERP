const path = require("path");
const db = require("./config/db");
const { parseWithDOM } = require("./utils/xmlParser");

const books = parseWithDOM(path.join(__dirname, "data", "books.xml"));

const exists = db.prepare("SELECT id FROM books WHERE isbn = ?");
const insert = db.prepare(
  "INSERT INTO books (title, author, isbn, status) VALUES (?, ?, ?, ?)"
);

let added = 0;
db.transaction(() => {
  for (const b of books) {
    if (!exists.get(b.isbn)) {
      insert.run(b.title, b.author, b.isbn, b.status);
      added++;
    }
  }
})();

console.log(`Parsed ${books.length} books from XML, inserted ${added} new.`);
