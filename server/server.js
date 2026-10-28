const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io for Real-time notice broadcasts
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected to Socket.IO:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Helmet.js - Configures HTTP security headers (Task-3 Security Requirement)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows static file downloads by React client
  })
);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded attachments
// Direct stream from MongoDB database for any /uploads/ link
app.get("/uploads/:filename", async (req, res, next) => {
  try {
    const Notice = require("./models/Notice");
    const filename = req.params.filename;
    const mongoose = require("mongoose");
    const isId = mongoose.isValidObjectId(filename);
    const notice = await Notice.findOne({
      $or: [{ attachment: filename }, { _id: isId ? filename : null }]
    }).select("+attachment_data");

    if (notice && notice.attachment_data && notice.attachment_data.length > 0) {
      res.set({
        "Content-Type": notice.attachment_mimetype || "application/pdf",
        "Content-Disposition": `inline; filename="${notice.attachment_original_name || filename}"`,
        "Content-Length": notice.attachment_data.length,
      });
      return res.send(notice.attachment_data);
    }
  } catch (err) {
    // proceed to static fallback
  }
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/admin", adminRoutes);

// Health check route with headers demonstration
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    security: "Helmet.js & Joi active",
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error Handling Middleware (Unit-4 Express Middleware #5)
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  console.log("Security libraries initialized: Helmet.js, Joi, bcrypt");
});
