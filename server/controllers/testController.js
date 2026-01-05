const Test = require("../models/Test");
const Question = require("../models/Question");
const Progress = require("../models/Progress");
const User = require("../models/User");
const { DEFAULT_TEST_CONFIG } = require("../utils/constants");

// CREATE NEW TEST
exports.createTest = async (req, res) => {
    try {
        const {
            topic = "All",
            difficulty = "All",
            questionCount = DEFAULT_TEST_CONFIG.QUESTION_COUNT,
            duration = DEFAULT_TEST_CONFIG.DURATION,
        } = req.body;

        // Build filter for questions
        const filter = {};
        if (topic !== "All") filter.topic = topic;
        if (difficulty !== "All") filter.difficulty = difficulty;

        // Get random questions
        const questions = await Question.aggregate([
            { $match: filter },
            { $sample: { size: parseInt(questionCount) } },
        ]);

        if (questions.length === 0) {
            return res
                .status(404)
                .json({ message: "No questions found for the selected criteria" });
        }

        // Create test
        const test = await Test.create({
            userId: req.user.id,
            testType:
                topic !== "All"
                    ? "topic-based"
                    : difficulty !== "All"
                        ? "difficulty-based"
                        : "mixed",
            topic,
            difficulty,
            duration: parseInt(duration),
            startTime: new Date(),
            questions: questions.map((q) => ({
                questionId: q._id,
                correctAnswer: q.correctAnswer,
                topic: q.topic,
            })),
            totalMarks: questions.length,
        });

        // Populate questions for response
        await test.populate("questions.questionId", "-correctAnswer");

        res.status(201).json({
            testId: test._id,
            duration: test.duration,
            startTime: test.startTime,
            questions: test.questions.map((q) => ({
                _id: q.questionId._id,
                title: q.questionId.title,
                options: q.questionId.options,
                topic: q.questionId.topic,
                difficulty: q.questionId.difficulty,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create test",
            error: error.message,
        });
    }
};

// GET ACTIVE TEST
exports.getActiveTest = async (req, res) => {
    try {
        const test = await Test.findOne({
            userId: req.user.id,
            isCompleted: false,
        })
            .populate("questions.questionId", "-correctAnswer")
            .sort({ createdAt: -1 });

        if (!test) {
            return res.status(404).json({ message: "No active test found" });
        }

        res.json({
            testId: test._id,
            duration: test.duration,
            startTime: test.startTime,
            questions: test.questions.map((q) => ({
                _id: q.questionId._id,
                title: q.questionId.title,
                options: q.questionId.options,
                topic: q.questionId.topic,
                difficulty: q.questionId.difficulty,
                selectedAnswer: q.selectedAnswer || null,
            })),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch active test",
            error: error.message,
        });
    }
};

// SUBMIT TEST
exports.submitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { answers, timeTaken } = req.body;

        const test = await Test.findOne({
            _id: testId,
            userId: req.user.id,
        });

        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        if (test.isCompleted) {
            return res.status(400).json({ message: "Test already submitted" });
        }

        // Calculate score and update test
        let score = 0;
        const topicStats = {};

        test.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            question.selectedAnswer = userAnswer;
            question.isCorrect = isCorrect;

            if (isCorrect) score++;

            // Track topic stats
            if (!topicStats[question.topic]) {
                topicStats[question.topic] = { attempts: 0, correct: 0 };
            }
            topicStats[question.topic].attempts++;
            if (isCorrect) topicStats[question.topic].correct++;
        });

        test.score = score;
        test.timeTaken = timeTaken;
        test.isCompleted = true;
        test.submittedAt = new Date();

        await test.save();

        // Update progress for each topic
        for (const [topic, stats] of Object.entries(topicStats)) {
            let progress = await Progress.findOne({
                userId: req.user.id,
                topic,
            });

            if (!progress) {
                progress = await Progress.create({
                    userId: req.user.id,
                    topic,
                    attempts: stats.attempts,
                    correctAnswers: stats.correct,
                    lastAttemptedAt: new Date(),
                });
            } else {
                progress.attempts += stats.attempts;
                progress.correctAnswers += stats.correct;
                progress.lastAttemptedAt = new Date();
                await progress.save();
            }
        }

        // Update user's attempted questions
        const user = await User.findById(req.user.id);
        for (const question of test.questions) {
            const existingAttempt = user.attemptedQuestions.find(
                (aq) => aq.questionId.toString() === question.questionId.toString()
            );

            if (!existingAttempt) {
                user.attemptedQuestions.push({
                    questionId: question.questionId,
                    isCorrect: question.isCorrect,
                    attemptedAt: new Date(),
                });
            }
        }
        await user.save();

        res.json({
            message: "Test submitted successfully",
            score,
            totalMarks: test.totalMarks,
            percentage: Math.round((score / test.totalMarks) * 100),
            timeTaken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to submit test",
            error: error.message,
        });
    }
};

// GET TEST RESULTS
exports.getTestResults = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findOne({
            _id: testId,
            userId: req.user.id,
        }).populate("questions.questionId");

        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        if (!test.isCompleted) {
            return res
                .status(400)
                .json({ message: "Test not completed yet" });
        }

        res.json({
            score: test.score,
            totalMarks: test.totalMarks,
            percentage: Math.round((test.score / test.totalMarks) * 100),
            timeTaken: test.timeTaken,
            submittedAt: test.submittedAt,
            questions: test.questions.map((q) => ({
                question: q.questionId.title,
                topic: q.topic,
                options: q.questionId.options,
                correctAnswer: q.correctAnswer,
                selectedAnswer: q.selectedAnswer,
                isCorrect: q.isCorrect,
            })),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch test results",
            error: error.message,
        });
    }
};

// GET TEST HISTORY
exports.getTestHistory = async (req, res) => {
    try {
        const tests = await Test.find({
            userId: req.user.id,
            isCompleted: true,
        })
            .select("score totalMarks topic difficulty createdAt timeTaken")
            .sort({ createdAt: -1 })
            .limit(20);

        const history = tests.map((test) => ({
            testId: test._id,
            score: test.score,
            totalMarks: test.totalMarks,
            percentage: Math.round((test.score / test.totalMarks) * 100),
            topic: test.topic,
            difficulty: test.difficulty,
            date: test.createdAt,
            timeTaken: test.timeTaken,
        }));

        res.json(history);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch test history",
            error: error.message,
        });
    }
};

// START TEST (Legacy endpoint for compatibility)
exports.startTest = async (req, res) => {
    try {
        // This is for backward compatibility
        // Redirect to create test with default config
        const questions = await Question.aggregate([
            { $sample: { size: DEFAULT_TEST_CONFIG.QUESTION_COUNT } },
        ]);

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
