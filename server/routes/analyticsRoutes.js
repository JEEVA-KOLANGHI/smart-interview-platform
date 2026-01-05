const express = require("express");
const router = express.Router();
const {
    getOverview,
    getTopicPerformance,
    getDifficultyPerformance,
    getInsights,
    getWeakStrongAreas,
    getProgressOverTime,
} = require("../controllers/analyticsController");
const protect = require("../middleware/authMiddleware");

// All routes are protected (user only)
router.get("/overview", protect, getOverview);
router.get("/topic-performance", protect, getTopicPerformance);
router.get("/difficulty-performance", protect, getDifficultyPerformance);
router.get("/insights", protect, getInsights);
router.get("/weak-strong-areas", protect, getWeakStrongAreas);
router.get("/progress-over-time", protect, getProgressOverTime);

module.exports = router;
