const Question = require("../models/Question");
const Test = require("../models/Test");
const Progress = require("../models/Progress");

// START TEST
exports.startTest = async (req, res) => {
    try {
        const questions = await Question.aggregate([{ $sample: { size: 5 } }]);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SUBMIT TEST
// SUBMIT TEST
exports.submitTest = async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;

        let score = 0;

        // calculate score
        for (let q of answers) {
            if (q.selectedAnswer === q.correctAnswer) {
                score++;
            }

            // 🔹 UPDATE PROGRESS (topic-wise)
            let progress = await Progress.findOne({
                userId: req.user.id,
                topic: q.topic,
            });

            if (!progress) {
                await Progress.create({
                    userId: req.user.id,
                    topic: q.topic,
                    attempts: 1,
                    correctAnswers:
                        q.selectedAnswer === q.correctAnswer ? 1 : 0,
                });
            } else {
                progress.attempts += 1;
                if (q.selectedAnswer === q.correctAnswer) {
                    progress.correctAnswers += 1;
                }
                await progress.save();
            }
        }

        // save test
        const test = await Test.create({
            userId: req.user.id,
            questions: answers,
            score,
            totalMarks: answers.length,
            timeTaken,
        });

        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

