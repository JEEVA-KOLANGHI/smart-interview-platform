const Question = require("../models/Question");

// ADMIN: Add Question
exports.addQuestion = async (req, res) => {
    try {
        const { title, options, correctAnswer, topic, difficulty } = req.body;

        // 🔴 SAFETY CHECK
        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "Correct answer must match one of the options",
            });
        }

        const question = await Question.create({
            title,
            options,
            correctAnswer,
            topic,
            difficulty,
        });

        res.status(201).json(question);
    } catch (error) {
        console.error(error); // 👈 ADD THIS
        res.status(500).json({ message: error.message });
    }
};


// USER: Get Questions (filter supported)
exports.getQuestions = async (req, res) => {
    try {
        const { topic, difficulty } = req.query;

        const filter = {};
        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;

        const questions = await Question.find(filter);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
