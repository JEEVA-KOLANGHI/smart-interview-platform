const User = require("../models/User");
const Test = require("../models/Test");

// Get user profile with stats
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("bookmarkedQuestions", "title topic difficulty");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get incomplete tests
        const incompleteTests = await Test.find({
            userId: req.user.id,
            isCompleted: false,
        }).select("topic difficulty createdAt");

        res.json({
            user,
            incompleteTests,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user profile",
            error: error.message,
        });
    }
};

// Delete incomplete test
exports.deleteIncompleteTest = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findOne({
            _id: testId,
            userId: req.user.id,
            isCompleted: false,
        });

        if (!test) {
            return res.status(404).json({
                message: "Incomplete test not found",
            });
        }

        await Test.findByIdAndDelete(testId);

        res.json({ message: "Incomplete test deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete test",
            error: error.message,
        });
    }
};

// Get all incomplete tests
exports.getIncompleteTests = async (req, res) => {
    try {
        const tests = await Test.find({
            userId: req.user.id,
            isCompleted: false,
        })
            .select("topic difficulty createdAt startTime duration")
            .sort({ createdAt: -1 });

        res.json(tests);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch incomplete tests",
            error: error.message,
        });
    }
};

// Request Admin Access
exports.requestAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "admin") {
            return res.status(400).json({ message: "User is already an admin" });
        }

        if (user.roleRequestStatus === "pending") {
            return res.status(400).json({ message: "Request is already pending" });
        }

        user.roleRequestStatus = "pending";
        await user.save();

        res.json({ message: "Admin access request submitted successfully", status: "pending" });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit request", error: error.message });
    }
};

// Get all pending admin requests (Admin only)
exports.getAdminRequests = async (req, res) => {
    try {
        const requests = await User.find({ roleRequestStatus: "pending" })
            .select("name email roleRequestStatus createdAt");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch requests", error: error.message });
    }
};

// Handle admin request (Approve/Reject)
exports.handleAdminRequest = async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'approve' or 'reject'

        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (action === "approve") {
            user.role = "admin";
            user.roleRequestStatus = "approved";
        } else {
            user.roleRequestStatus = "rejected";
        }

        await user.save();

        res.json({
            message: `User request ${action}ed successfully`,
            user: { id: user._id, role: user.role, status: user.roleRequestStatus }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to handle request", error: error.message });
    }
};
