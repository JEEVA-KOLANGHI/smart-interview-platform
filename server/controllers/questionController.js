const Question = require("../models/Question");
const { PAGINATION } = require("../utils/constants");

// GET ALL QUESTIONS with filtering and pagination
exports.getQuestions = async (req, res) => {
    try {
        const {
            topic,
            difficulty,
            search,
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
        } = req.query;

        // Build filter object
        const filter = {};
        if (topic && topic !== "All") filter.topic = topic;
        if (difficulty && difficulty !== "All") filter.difficulty = difficulty;
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
        const skip = (pageNum - 1) * limitNum;

        const questions = await Question.find(filter)
            .select("-__v")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await Question.countDocuments(filter);

        res.json({
            questions,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalQuestions: total,
                hasMore: skip + questions.length < total,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch questions",
            error: error.message,
        });
    }
};

// GET SINGLE QUESTION BY ID
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch question",
            error: error.message,
        });
    }
};

// ADD QUESTION (Admin only)
exports.addQuestion = async (req, res) => {
    try {
        const { title, options, correctAnswer, topic, difficulty } = req.body;

        // Validation
        if (!title || !options || !correctAnswer || !topic || !difficulty) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res
                .status(400)
                .json({ message: "At least 2 options required" });
        }

        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "Correct answer must be one of the options",
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
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// UPDATE QUESTION (Admin only)
exports.updateQuestion = async (req, res) => {
    try {
        const { title, options, correctAnswer, topic, difficulty } = req.body;

        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Validation
        if (options && correctAnswer && !options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "Correct answer must be one of the options",
            });
        }

        // Update fields
        if (title) question.title = title;
        if (options) question.options = options;
        if (correctAnswer) question.correctAnswer = correctAnswer;
        if (topic) question.topic = topic;
        if (difficulty) question.difficulty = difficulty;

        await question.save();

        res.json({
            message: "Question updated successfully",
            question,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update question",
            error: error.message,
        });
    }
};

// DELETE QUESTION (Admin only)
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        await Question.findByIdAndDelete(req.params.id);

        res.json({ message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete question",
            error: error.message,
        });
    }
};
