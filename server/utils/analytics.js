const Progress = require("../models/Progress");
const Test = require("../models/Test");

/**
 * Calculate accuracy percentage
 */
const calculateAccuracy = (correct, total) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
};

/**
 * Get overall analytics for a user
 */
const getOverallStats = async (userId) => {
    const progressData = await Progress.find({ userId });
    const tests = await Test.find({ userId, isCompleted: true });

    let totalAttempts = 0;
    let totalCorrect = 0;

    progressData.forEach((progress) => {
        totalAttempts += progress.attempts;
        totalCorrect += progress.correctAnswers;
    });

    const overallAccuracy = calculateAccuracy(totalCorrect, totalAttempts);
    const totalTests = tests.length;
    const avgTestScore =
        totalTests > 0
            ? Math.round(
                tests.reduce((sum, test) => sum + test.score, 0) / totalTests
            )
            : 0;

    return {
        totalAttempts,
        totalCorrect,
        overallAccuracy,
        totalTests,
        avgTestScore,
    };
};

/**
 * Get topic-wise performance
 */
const getTopicPerformance = async (userId) => {
    const progressData = await Progress.find({ userId });

    return progressData.map((progress) => ({
        topic: progress.topic,
        attempts: progress.attempts,
        correct: progress.correctAnswers,
        accuracy: calculateAccuracy(progress.correctAnswers, progress.attempts),
        lastAttempted: progress.lastAttemptedAt,
    }));
};

/**
 * Get difficulty-wise performance across all topics
 */
const getDifficultyPerformance = async (userId) => {
    const progressData = await Progress.find({ userId });

    const difficultyStats = {
        easy: { attempts: 0, correct: 0 },
        medium: { attempts: 0, correct: 0 },
        hard: { attempts: 0, correct: 0 },
    };

    progressData.forEach((progress) => {
        if (progress.difficultyBreakdown) {
            ["easy", "medium", "hard"].forEach((level) => {
                difficultyStats[level].attempts +=
                    progress.difficultyBreakdown[level]?.attempts || 0;
                difficultyStats[level].correct +=
                    progress.difficultyBreakdown[level]?.correct || 0;
            });
        }
    });

    return {
        easy: {
            ...difficultyStats.easy,
            accuracy: calculateAccuracy(
                difficultyStats.easy.correct,
                difficultyStats.easy.attempts
            ),
        },
        medium: {
            ...difficultyStats.medium,
            accuracy: calculateAccuracy(
                difficultyStats.medium.correct,
                difficultyStats.medium.attempts
            ),
        },
        hard: {
            ...difficultyStats.hard,
            accuracy: calculateAccuracy(
                difficultyStats.hard.correct,
                difficultyStats.hard.attempts
            ),
        },
    };
};

/**
 * Generate smart insights based on user performance
 */
const generateInsights = async (userId) => {
    const topicPerformance = await getTopicPerformance(userId);
    const difficultyPerformance = await getDifficultyPerformance(userId);
    const insights = [];

    // Topic-based insights
    const sortedByAccuracy = [...topicPerformance].sort(
        (a, b) => a.accuracy - b.accuracy
    );

    if (sortedByAccuracy.length > 0) {
        const weakest = sortedByAccuracy[0];
        if (weakest.attempts > 0 && weakest.accuracy < 50) {
            insights.push({
                type: "warning",
                message: `Your accuracy in ${weakest.topic} is ${weakest.accuracy}%. Practice more!`,
            });
        }

        const strongest = sortedByAccuracy[sortedByAccuracy.length - 1];
        if (strongest.attempts >= 5 && strongest.accuracy >= 80) {
            insights.push({
                type: "success",
                message: `Excellent performance in ${strongest.topic} with ${strongest.accuracy}% accuracy!`,
            });
        }
    }

    // Difficulty-based insights
    const diffEntries = Object.entries(difficultyPerformance);
    const highestDifficulty = diffEntries.reduce((max, [level, stats]) =>
        stats.accuracy > max.accuracy ? { level, ...stats } : max
        , { level: "", accuracy: 0 });

    if (highestDifficulty.accuracy > 0) {
        insights.push({
            type: "info",
            message: `You perform best on ${highestDifficulty.level.charAt(0).toUpperCase() +
                highestDifficulty.level.slice(1)
                } questions (${highestDifficulty.accuracy}% accuracy)`,
        });
    }

    // Practice suggestion
    const topicsNeedingPractice = topicPerformance.filter(
        (t) => t.attempts < 10 || t.accuracy < 60
    );
    if (topicsNeedingPractice.length > 0) {
        insights.push({
            type: "tip",
            message: `Focus on: ${topicsNeedingPractice
                .slice(0, 3)
                .map((t) => t.topic)
                .join(", ")}`,
        });
    }

    return insights;
};

/**
 * Identify weak and strong areas
 */
const getWeakAndStrongAreas = async (userId) => {
    const topicPerformance = await getTopicPerformance(userId);

    const sorted = [...topicPerformance]
        .filter((t) => t.attempts >= 3) // Only consider topics with sufficient attempts
        .sort((a, b) => a.accuracy - b.accuracy);

    const weakAreas = sorted.slice(0, 3).map((t) => ({
        topic: t.topic,
        accuracy: t.accuracy,
        attempts: t.attempts,
    }));

    const strongAreas = sorted
        .slice(-3)
        .reverse()
        .map((t) => ({
            topic: t.topic,
            accuracy: t.accuracy,
            attempts: t.attempts,
        }));

    return { weakAreas, strongAreas };
};

module.exports = {
    calculateAccuracy,
    getOverallStats,
    getTopicPerformance,
    getDifficultyPerformance,
    generateInsights,
    getWeakAndStrongAreas,
};
