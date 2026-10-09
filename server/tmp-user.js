const db = require("./config/db");
db.prepare(
  "INSERT OR IGNORE INTO users (name, email, password_hash, department, role) VALUES ('Test', 'test@x.com', 'x', 'MCA', 'student')"
).run();
console.log(db.prepare("SELECT id FROM users WHERE email = 'test@x.com'").get());
