const Progress = require("../models/Progress");

exports.getAnalytics = async (req, res) => {
    try {
        const data = await Progress.find({ userId: req.user.id });

        const analytics = data.map((item) => ({
            topic: item.topic,
            attempts: item.attempts,
            accuracy:
                item.attempts === 0
                    ? 0
                    : Math.round((item.correctAnswers / item.attempts) * 100),
        }));

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
