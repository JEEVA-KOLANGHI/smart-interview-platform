const express = require("express");
const {
    addQuestion,
    getQuestions,
} = require("../controllers/questionController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// admin only
router.post("/", protect, addQuestion);

// logged-in users
router.get("/", protect, getQuestions);

module.exports = router;
