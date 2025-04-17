const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();

const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
// 新增
const boardRoutes = require("./routes/boardRoutes");
app.use("/api/boards", boardRoutes);


const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`\n🔍 ${req.method} ${req.url}`);
  console.log('📝 Headers:', JSON.stringify(req.headers, null, 2));
  
  // 记录请求体
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  // 记录查询参数
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('🔎 Query Parameters:', JSON.stringify(req.query, null, 2));
  }
  
  // 记录URL参数
  if (req.params && Object.keys(req.params).length > 0) {
    console.log('🔗 URL Parameters:', JSON.stringify(req.params, null, 2));
  }
  
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/boards", boardRoutes); 

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
