const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const app = express();

const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const boardRoutes = require("./routes/boardRoutes");
app.use("/api/boards", boardRoutes);

const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Check if dist directory exists before serving static files
const distPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(distPath)) {
  // Serve static files (for React app)
  app.use(express.static(distPath));

  // Default route for the root URL
  app.get("/", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // Catch-all for other routes, useful for SPAs
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("⚠️  No dist directory found, skipping static file serving");
}

app.use((req, res, next) => {
  console.log(`\n🔍 ${req.method} ${req.url}`);
  console.log("📝 Headers:", JSON.stringify(req.headers, null, 2));
  console.log("🍪 Cookies:", JSON.stringify(req.cookies, null, 2));

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  }

  if (req.query && Object.keys(req.query).length > 0) {
    console.log("🔎 Query Parameters:", JSON.stringify(req.query, null, 2));
  }

  if (req.params && Object.keys(req.params).length > 0) {
    console.log("🔗 URL Parameters:", JSON.stringify(req.params, null, 2));
  }

  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/boards", boardRoutes);

// MongoDB connection
console.log("🔗  MONGO_URI =", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, { dbName: "battleship" })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log("🗄️  Using DB:", mongoose.connection.db.databaseName);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
