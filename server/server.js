require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const mount = (prefix, file) => {
  try {
    app.use(prefix, require(file));
  } catch (e) {
    console.warn(`Skipped ${file}: ${e.message}`);
  }
};

mount("/api", "./routes/auth.routes");
mount("/api/equipment", "./routes/equipment.routes");
mount("/api/books", "./routes/books.routes");
mount("/api/admin", "./routes/admin.routes");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
