import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import QuestionCard from "../components/QuestionCard";
import LoadingSpinner from "../components/LoadingSpinner";
import AIFeedbackModal from "../components/AIFeedbackModal";
import API from "../services/api";
import "./Practice.css";

const Practice = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [showAnswer, setShowAnswer] = useState(false);
    const [filters, setFilters] = useState({ topic: "All", difficulty: "All" });
    const [bookmarked, setBookmarked] = useState([]);
    const [loading, setLoading] = useState(true);

    // AI Feedback State
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiFeedback, setAiFeedback] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Challenge Mode State
    const [isChallengeMode, setIsChallengeMode] = useState(false);
    const [challengeQuestion, setChallengeQuestion] = useState(null);
    const [generatingChallenge, setGeneratingChallenge] = useState(false);

    // Fetch questions when filters change
    useEffect(() => {
        fetchQuestions();
        // Reset challenge state when filters change so user see "Generate" for new topic immediately
        if (isChallengeMode) {
            setChallengeQuestion(null);
            setShowAnswer(false);
            setSelectedAnswer("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Fetch bookmarks on mount
    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.topic !== "All") params.topic = filters.topic;
            if (filters.difficulty !== "All") params.difficulty = filters.difficulty;

            const res = await API.get("/questions", { params });
            setQuestions(res.data.questions || res.data);
            setCurrentIndex(0);
            setSelectedAnswer("");
            setShowAnswer(false);
        } catch (error) {
            console.error("Failed to fetch questions");
        } finally {
            setLoading(false);
        }
    };

    const fetchBookmarks = async () => {
        try {
            const res = await API.get("/bookmarks");
            setBookmarked(res.data.map((q) => q._id));
        } catch (error) {
            console.error("Failed to fetch bookmarks");
        }
    };

    const handleToggleBookmark = async () => {
        const currentQ = isChallengeMode ? challengeQuestion : questions[currentIndex];
        const questionId = currentQ._id;

        try {
            const payload = { questionId };
            if (questionId.startsWith("ai_")) {
                payload.questionData = currentQ;
            }

            const res = await API.post("/bookmarks/toggle", payload);

            // If the backend saved the question and returned a new ID, update our local state
            if (res.data.currentQuestionId && res.data.currentQuestionId !== questionId) {
                if (isChallengeMode && challengeQuestion) {
                    setChallengeQuestion({ ...challengeQuestion, _id: res.data.currentQuestionId });
                } else {
                    // Update in questions array if needed (though unlikely for AI q in standard list)
                    const newQuestions = [...questions];
                    if (newQuestions[currentIndex]) {
                        newQuestions[currentIndex]._id = res.data.currentQuestionId;
                        setQuestions(newQuestions);
                    }
                }
                // Update bookmarked list with new ID
                if (bookmarked.includes(res.data.currentQuestionId)) {
                    setBookmarked(bookmarked.filter((id) => id !== res.data.currentQuestionId));
                } else {
                    setBookmarked([...bookmarked, res.data.currentQuestionId]);
                }
            } else {
                // Standard toggle
                if (bookmarked.includes(questionId)) {
                    setBookmarked(bookmarked.filter((id) => id !== questionId));
                } else {
                    setBookmarked([...bookmarked, questionId]);
                }
            }
        } catch (error) {
            console.error("Failed to toggle bookmark", error);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer("");
            setShowAnswer(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedAnswer("");
            setShowAnswer(false);
        }
    };

    const handleSubmitAnswer = () => {
        setShowAnswer(true);
    };

    const handleAnalyzeCode = async () => {
        setAiModalOpen(true);
        setAiLoading(true);
        try {
            // For multiple choice, we simulate analyzing the user's "reasoning" or just the question context
            // In a real coding editor, we would pass the actual code string
            const currentQ = isChallengeMode ? challengeQuestion : questions[currentIndex];
            const codeToAnalyze = `// Context: ${currentQ.title}\n// User selected: ${selectedAnswer}\n// Correct Answer: ${currentQ.correctAnswer}`;

            const res = await API.post("/ai/analyze-code", {
                code: codeToAnalyze,
                language: "javascript",
                problemDescription: currentQ.title
            });
            setAiFeedback(res.data);
        } catch (error) {
            console.error("AI Analysis failed:", error);
            setAiFeedback({
                qualityScore: 0,
                feedback: "Failed to generate analysis. Please try again.",
                suggestions: []
            });
        } finally {
            setAiLoading(false);
        }
    };

    const handleStartChallenge = () => {
        setIsChallengeMode(true);
        setChallengeQuestion(null);
        setSelectedAnswer("");
        setShowAnswer(false);
    };

    const handleExitChallenge = () => {
        setIsChallengeMode(false);
        setChallengeQuestion(null);
        setSelectedAnswer("");
        setShowAnswer(false);
    };

    const handleGenerateChallenge = async () => {
        setGeneratingChallenge(true);
        setChallengeQuestion(null);
        setSelectedAnswer("");
        setShowAnswer(false);

        try {
            // Default to "DSA" and "Medium" if "All" is selected, to ensure good generation
            const topicToUse = filters.topic === "All" ? "DSA" : filters.topic;
            const diffToUse = filters.difficulty === "All" ? "Medium" : filters.difficulty;

            const res = await API.post("/ai/generate-question", {
                topic: topicToUse,
                difficulty: diffToUse
            });

            // Add metadata for QuestionCard
            const questionWithMeta = {
                ...res.data,
                _id: `ai_${Date.now()}`,
                topic: topicToUse,
                difficulty: diffToUse
            };

            setChallengeQuestion(questionWithMeta);
        } catch (error) {
            console.error("Failed to generate challenge", error);
            alert("Failed to generate a challenge question. Please try again.");
        } finally {
            setGeneratingChallenge(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Practice Questions">
                <LoadingSpinner message="Loading questions..." />
            </Layout>
        );
    }

    // Only show empty state if NOT in challenge mode
    // (In challenge mode, we generate new questions, so existing list doesn't matter)
    if (!isChallengeMode && questions.length === 0) {
        return (
            <Layout title="Practice Questions">
                <div className="empty-state">
                    <h3>No questions found</h3>
                    <p>Try changing the filters or contact admin to add questions.</p>
                    <button
                        className="btn btn-warning"
                        style={{ marginTop: '1rem' }}
                        onClick={handleStartChallenge}
                    >
                        ⚔️ Generative AI Challenge
                    </button>
                </div>
            </Layout>
        );
    }

    const currentQuestion = isChallengeMode ? challengeQuestion : questions[currentIndex];
    const isBookmarked = currentQuestion && bookmarked.includes(currentQuestion._id);

    return (
        <Layout title="Practice Questions">
            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Topic:</label>
                    <select
                        value={filters.topic}
                        onChange={(e) =>
                            setFilters({ ...filters, topic: e.target.value })
                        }
                    >
                        <option value="All">All Topics</option>
                        <option value="DSA">DSA</option>
                        <option value="Java">Java</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="SQL">SQL</option>
                        <option value="HR">HR</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Difficulty:</label>
                    <select
                        value={filters.difficulty}
                        onChange={(e) =>
                            setFilters({ ...filters, difficulty: e.target.value })
                        }
                    >
                        <option value="All">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div className="question-counter">
                    {!isChallengeMode ? `Question ${currentIndex + 1} of ${questions.length}` : (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ marginLeft: 'auto' }}
                            onClick={handleExitChallenge}
                        >
                            Target Practice
                        </button>
                    )}
                </div>
                {!isChallengeMode && (
                    <button
                        className="btn btn-warning"
                        style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}
                        onClick={handleStartChallenge}
                    >
                        ⚔️ Challenge Me
                    </button>
                )}
            </div>

            {/* Question Card */}
            {isChallengeMode && !challengeQuestion && !generatingChallenge ? (
                <div className="challenge-intro">
                    <h3>Ready for a Challenge?</h3>
                    <p>Select your topic and difficulty above, then click Generate.</p>
                    <button
                        className="btn btn-lg btn-primary"
                        onClick={handleGenerateChallenge}
                        style={{ marginTop: '20px' }}
                    >
                        Generate Question
                    </button>
                </div>
            ) : (
                (generatingChallenge) ? (
                    <LoadingSpinner message="AI is crafting your challenge..." />
                ) : (
                    currentQuestion && (
                        <QuestionCard
                            question={currentQuestion}
                            selectedAnswer={selectedAnswer}
                            onSelectAnswer={setSelectedAnswer}
                            showAnswer={showAnswer}
                            isBookmarked={isBookmarked}
                            onToggleBookmark={handleToggleBookmark}
                            showBookmark={!isChallengeMode} // Hide bookmark for AI questions as they aren't in DB yet
                        />
                    )
                )
            )}

            {/* Navigation Buttons */}
            <div className="nav-buttons">
                {!isChallengeMode ? (
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                        >
                            ← Previous
                        </button>

                        {!showAnswer ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswer}
                            >
                                Check Answer
                            </button>
                        ) : (
                            <button
                                className="btn btn-success"
                                onClick={handleNext}
                                disabled={currentIndex === questions.length - 1}
                            >
                                Next Question →
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={handleExitChallenge}
                        >
                            Exit Challenge
                        </button>

                        {challengeQuestion && !showAnswer && (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswer}
                            >
                                Check Answer
                            </button>
                        )}

                        {(!challengeQuestion || showAnswer) && (
                            <button
                                className="btn btn-challenge"
                                onClick={handleGenerateChallenge}
                                disabled={generatingChallenge}
                                style={{ background: '#e17055', color: 'white' }}
                            >
                                {generatingChallenge ? "Generating..." : (challengeQuestion ? "Next Challenge →" : "Generate Challenge")}
                            </button>
                        )}
                    </>
                )}
            </div>

            <div className="ai-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    className="btn btn-ai"
                    onClick={handleAnalyzeCode}
                    style={{ background: 'linear-gradient(45deg, #6c5ce7, #a29bfe)', border: 'none' }}
                >
                    🤖 Analyze with AI Coach
                </button>
            </div>

            <AIFeedbackModal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                loading={aiLoading}
                feedback={aiFeedback}
            />
        </Layout>
    );
};

export default Practice;
