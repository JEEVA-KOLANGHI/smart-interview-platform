const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    deleteIncompleteTest,
    getIncompleteTests,
    requestAdmin,
    getAdminRequests,
    handleAdminRequest,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// User routes
router.get("/profile", protect, getUserProfile);
router.get("/incomplete-tests", protect, getIncompleteTests);
router.delete("/incomplete-tests/:testId", protect, deleteIncompleteTest);
router.post("/request-admin", protect, requestAdmin);

// Admin routes
router.get("/admin-requests", protect, adminMiddleware, getAdminRequests);
router.post("/handle-admin-request", protect, adminMiddleware, handleAdminRequest);

// Admin: Get all users
router.get("/", protect, adminMiddleware, async (req, res) => {
    const User = require("../models/User");
    const users = await User.find().select("-password");
    res.json(users);
});

module.exports = router;
