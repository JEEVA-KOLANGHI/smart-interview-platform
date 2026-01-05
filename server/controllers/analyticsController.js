const {
    getOverallStats,
    getTopicPerformance,
    getDifficultyPerformance,
    generateInsights,
    getWeakAndStrongAreas,
} = require("../utils/analytics");
const Test = require("../models/Test");

// GET OVERALL ANALYTICS
exports.getOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await getOverallStats(userId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch overview",
            error: error.message,
        });
    }
};

// GET TOPIC-WISE PERFORMANCE
exports.getTopicPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const performance = await getTopicPerformance(userId);
        res.json(performance);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch topic performance",
            error: error.message,
        });
    }
};

// GET DIFFICULTY-WISE PERFORMANCE
exports.getDifficultyPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const performance = await getDifficultyPerformance(userId);
        res.json(performance);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch difficulty performance",
            error: error.message,
        });
    }
};

// GET INSIGHTS
exports.getInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const insights = await generateInsights(userId);
        res.json(insights);
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate insights",
            error: error.message,
        });
    }
};

// GET WEAK AND STRONG AREAS
exports.getWeakStrongAreas = async (req, res) => {
    try {
        const userId = req.user.id;
        const areas = await getWeakAndStrongAreas(userId);
        res.json(areas);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch weak and strong areas",
            error: error.message,
        });
    }
};

// GET PROGRESS OVER TIME
exports.getProgressOverTime = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all completed tests sorted by date
        const tests = await Test.find({
            userId,
            isCompleted: true,
        })
            .select("score totalMarks createdAt")
            .sort({ createdAt: 1 })
            .limit(30); // Last 30 tests

        const progressData = tests.map((test) => ({
            date: test.createdAt,
            score: test.score,
            totalMarks: test.totalMarks,
            percentage: Math.round((test.score / test.totalMarks) * 100),
        }));

        res.json(progressData);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch progress over time",
            error: error.message,
        });
    }
};
