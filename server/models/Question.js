const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        options: {
            type: [String],
            required: true,
        },
        correctAnswer: {
            type: String,
            required: true,
        },
        topic: {
            type: String,
            enum: ["DSA", "Java", "JavaScript", "SQL", "HR"],
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },
        explanation: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Add indexes for better query performance
questionSchema.index({ topic: 1, difficulty: 1 });
questionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Question", questionSchema);
