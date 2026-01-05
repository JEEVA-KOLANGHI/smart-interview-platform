const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        topic: {
            type: String,
            required: true,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        correctAnswers: {
            type: Number,
            default: 0,
        },
        difficultyBreakdown: {
            easy: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
            },
            medium: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
            },
            hard: {
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
            },
        },
        lastAttemptedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);
