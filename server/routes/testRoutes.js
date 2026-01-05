const express = require("express");
const router = express.Router();
const {
    createTest,
    getActiveTest,
    submitTest,
    getTestResults,
    getTestHistory,
    startTest,
} = require("../controllers/testController");
const protect = require("../middleware/authMiddleware");

// All routes are protected (user only)
router.post("/create", protect, createTest);
router.get("/active", protect, getActiveTest);
router.post("/:testId/submit", protect, submitTest);
router.get("/:testId/results", protect, getTestResults);
router.get("/history", protect, getTestHistory);

// Legacy endpoint
router.get("/start", protect, startTest);

module.exports = router;
