const User = require("../models/User");
const Question = require("../models/Question");

// ADD BOOKMARK
exports.addBookmark = async (req, res) => {
    try {
        const { questionId } = req.body;
        const userId = req.user.id;

        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Add to user's bookmarks
        const user = await User.findById(userId);

        // Check if already bookmarked
        if (user.bookmarkedQuestions.includes(questionId)) {
            return res.status(400).json({
                message: "Question already bookmarked",
            });
        }

        user.bookmarkedQuestions.push(questionId);
        await user.save();

        res.status(201).json({ message: "Question bookmarked successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to bookmark question",
            error: error.message,
        });
    }
};

// REMOVE BOOKMARK
exports.removeBookmark = async (req, res) => {
    try {
        const { questionId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);

        // Remove from bookmarks
        user.bookmarkedQuestions = user.bookmarkedQuestions.filter(
            (id) => id.toString() !== questionId
        );

        await user.save();

        res.json({ message: "Bookmark removed successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to remove bookmark",
            error: error.message,
        });
    }
};

// GET ALL BOOKMARKS
exports.getBookmarks = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate(
            "bookmarkedQuestions"
        );

        res.json(user.bookmarkedQuestions);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookmarks",
            error: error.message,
        });
    }
};

// TOGGLE BOOKMARK (convenience endpoint)
exports.toggleBookmark = async (req, res) => {
    try {
        const { questionId, questionData } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);

        // Check if it's an AI generated question (starts with ai_) or we need to create it
        let targetQuestionId = questionId;

        // If it looks like a temp ID or we have data to save
        if (questionId.startsWith("ai_") && questionData) {
            // Save the new question to DB
            const newQuestion = await Question.create({
                title: questionData.title,
                options: questionData.options,
                correctAnswer: questionData.correctAnswer,
                topic: questionData.topic || "General",
                difficulty: questionData.difficulty || "Medium",
                explanation: questionData.explanation || ""
            });
            targetQuestionId = newQuestion._id.toString();
        }

        const isBookmarked = user.bookmarkedQuestions.some(
            (id) => id.toString() === targetQuestionId
        );

        if (isBookmarked) {
            // Remove bookmark
            user.bookmarkedQuestions = user.bookmarkedQuestions.filter(
                (id) => id.toString() !== targetQuestionId
            );
            await user.save();
            res.json({
                message: "Bookmark removed",
                isBookmarked: false,
                currentQuestionId: targetQuestionId // Return real ID
            });
        } else {
            // Add bookmark
            user.bookmarkedQuestions.push(targetQuestionId);
            await user.save();

            res.json({
                message: "Question saved & bookmarked",
                isBookmarked: true,
                currentQuestionId: targetQuestionId // Return real ID to update frontend
            });
        }
    } catch (error) {
        console.error("Toggle bookmark error:", error);
        res.status(500).json({
            message: "Failed to toggle bookmark",
            error: error.message,
        });
    }
};
