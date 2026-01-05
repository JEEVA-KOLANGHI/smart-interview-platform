const express = require("express");
const router = express.Router();
const {
    addBookmark,
    removeBookmark,
    getBookmarks,
    toggleBookmark,
} = require("../controllers/bookmarkController");
const protect = require("../middleware/authMiddleware");

// All routes are protected (user only)
router.post("/", protect, addBookmark);
router.delete("/:questionId", protect, removeBookmark);
router.get("/", protect, getBookmarks);
router.post("/toggle", protect, toggleBookmark);

module.exports = router;
