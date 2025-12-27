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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
