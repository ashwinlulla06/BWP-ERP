require("dotenv").config();

const cors = require("cors");
const express = require("express");

const { initializeDatabase } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const equipmentRoutes = require("./routes/equipment.routes");
const adminRoutes = require("./routes/admin.routes");
const booksRoutes = require("./routes/books.routes");

const app = express();
const port = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set to a value of at least 32 characters.");
  process.exit(1);
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json({ limit: "100kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", booksRoutes);

const { setupSoap } = require("./utils/soapService");
setupSoap(app);

app.use((request, response) => {
  response.status(404).json({
    success: false,
    data: null,
    message: "API endpoint not found.",
  });
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({
      success: false,
      data: null,
      message: "Request body must contain valid JSON.",
    });
  }

  console.error(error);
  return response.status(500).json({
    success: false,
    data: null,
    message: "An unexpected server error occurred.",
  });
});

initializeDatabase()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`UniReserve API listening on http://localhost:${port}`);
      console.log(`SOAP endpoint available at http://localhost:${port}/wsdl?wsdl`);
    });
    const { setupSoap } = require("./utils/soapService");
    setupSoap(server);
  })
  .catch((error) => {
    console.error("Unable to initialize the database:", error);
    process.exit(1);
  });
