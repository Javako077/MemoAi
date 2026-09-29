require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { initCronJobs } = require("./services/cronService");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Supports avatar base64 uploads
app.use(express.urlencoded({ extended: true }));

// Connect to Database immediately on startup
connectDB().catch((err) => console.warn("Initial DB connection warning:", err.message));

// Ensure Database Connection for Serverless & Long-running requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn("DB Connection Warning:", err.message);
  }
  next();
});


// Initialize Background Cron Jobs (runs if not in ephemeral serverless environment)
try {
  initCronJobs();
} catch (cronErr) {
  console.warn("Cron initialization warning:", cronErr.message);
}

// API Routes
app.use("/api", routes);

// Base Health Check Route
app.get("/", (req, res) => {
  res.json({ message: "MemoAi Backend API is running successfully." });
});

// Central Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

