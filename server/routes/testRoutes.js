const express = require("express");
const { startTest, submitTest } = require("../controllers/testController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/start", protect, startTest);
router.post("/submit", protect, submitTest);

module.exports = router;
