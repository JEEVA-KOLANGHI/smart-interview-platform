const express = require("express");
const router = express.Router();
const { generateQuestion, getSmartInsights, analyzeCode } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

// Protect all AI routes
router.use(protect);

router.post("/generate-question", generateQuestion);
router.post("/insights", getSmartInsights);
router.post("/analyze-code", analyzeCode);

module.exports = router;
