const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");
const { errorHandler } = require("./utils/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const logger = require("./utils/logger");

dotenv.config();
connectDB();

const app = express();

// Security Middleware
app.use(helmet()); // Set security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use("/api/", apiLimiter);

// Request Logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("user-agent"),
    });
    next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const testRoutes = require("./routes/testRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/ai", aiRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "Smart Interview Platform API is running...",
        version: "2.0.0",
        status: "healthy",
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
    });
});

// Centralized Error Handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});


