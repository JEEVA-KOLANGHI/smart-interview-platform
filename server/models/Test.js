const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        testType: {
            type: String,
            enum: ["topic-based", "difficulty-based", "mixed"],
            default: "mixed",
        },
        topic: {
            type: String,
            enum: ["DSA", "Java", "JavaScript", "SQL", "HR", "All"],
            default: "All",
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard", "All"],
            default: "All",
        },
        duration: {
            type: Number, // in minutes
            default: 30,
        },
        startTime: {
            type: Date,
        },
        submittedAt: {
            type: Date,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        questions: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                },
                selectedAnswer: String,
                correctAnswer: String,
                isCorrect: Boolean,
                topic: String,
            },
        ],
        score: Number,
        totalMarks: Number,
        timeTaken: Number, // in seconds
    },
    { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
