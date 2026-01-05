const express = require("express");
const { register, login } = require("../controllers/authController");
const {
    validateRegister,
    validateLogin,
} = require("../middleware/validateRequest");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Apply rate limiting to auth routes
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);

module.exports = router;
