// Custom error classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message = "Authentication failed") {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = "Access denied") {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

// Centralized error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error("Error:", {
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
    });

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        error = new ValidationError("Invalid ID format");
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        error = new ValidationError(`${field} already exists`);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((val) => val.message);
        error = new ValidationError(messages.join(", "));
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error = new AuthenticationError("Invalid token");
    }

    if (err.name === "TokenExpiredError") {
        error = new AuthenticationError("Token expired");
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Server Error",
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};

// Async handler wrapper to catch errors in async functions
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    errorHandler,
    asyncHandler,
};
