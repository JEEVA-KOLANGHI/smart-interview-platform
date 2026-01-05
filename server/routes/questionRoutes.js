const express = require("express");
const router = express.Router();
const {
    getQuestions,
    getQuestionById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
} = require("../controllers/questionController");
const protect = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
    validateQuestion,
    validateObjectId,
} = require("../middleware/validateRequest");

// Public/Protected routes
router.get("/", protect, getQuestions);
router.get("/:id", protect, validateObjectId("id"), getQuestionById);

// Admin only routes
router.post("/", protect, adminMiddleware, validateQuestion, addQuestion);
router.put(
    "/:id",
    protect,
    adminMiddleware,
    validateObjectId("id"),
    validateQuestion,
    updateQuestion
);
router.delete(
    "/:id",
    protect,
    adminMiddleware,
    validateObjectId("id"),
    deleteQuestion
);

module.exports = router;
