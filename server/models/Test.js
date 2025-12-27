const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                },
                selectedAnswer: String,
                correctAnswer: String,
            },
        ],
        score: Number,
        totalMarks: Number,
        timeTaken: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
