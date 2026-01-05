const aiService = require("../services/aiService");

exports.generateQuestion = async (req, res) => {
    try {
        const { topic, difficulty } = req.body;
        if (!topic || !difficulty) {
            return res.status(400).json({ message: "Topic and difficulty are required" });
        }

        const question = await aiService.generateQuestion(topic, difficulty);
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate question", error: error.message });
    }
};

exports.getSmartInsights = async (req, res) => {
    try {
        // In a real app, we would fetch actual user history from DB
        const userHistory = req.body.history || [];
        const insights = await aiService.analyzePerformance(userHistory);
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate insights", error: error.message });
    }
};

exports.analyzeCode = async (req, res) => {
    try {
        const { code, language, problemDescription } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Code is required" });
        }

        const analysis = await aiService.analyzeCode(code, language || "javascript", problemDescription || "General query");
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: "Failed to analyze code", error: error.message });
    }
};
