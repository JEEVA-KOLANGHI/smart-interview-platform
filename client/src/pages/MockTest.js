import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Timer from "../components/Timer";
import QuestionCard from "../components/QuestionCard";
import LoadingSpinner from "../components/LoadingSpinner";
import API from "../services/api";
import "./MockTest.css";

const MockTest = () => {
    const navigate = useNavigate();
    const [testConfig, setTestConfig] = useState({
        topic: "All",
        difficulty: "All",
        questionCount: 10,
        duration: 30,
    });
    const [test, setTest] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showingResults, setShowingResults] = useState(false);
    const [results, setResults] = useState(null);
    const [startTime, setStartTime] = useState(null);

    const startTest = async () => {
        setLoading(true);
        try {
            const res = await API.post("/tests/create", testConfig);
            setTest(res.data);
            setAnswers(new Array(res.data.questions.length).fill(""));
            setStartTime(Date.now());
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to start test";
            if (errorMsg.includes("No questions found")) {
                alert(
                    `No questions available for the selected criteria.\n\n` +
                    `Topic: ${testConfig.topic}\n` +
                    `Difficulty: ${testConfig.difficulty}\n\n` +
                    `Please try different settings or contact admin to add more questions.`
                );
            } else {
                alert(`Failed to start test: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentIndex] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit the test?")) {
            return;
        }

        setLoading(true);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000); // in seconds

        try {
            const res = await API.post(`/tests/${test.testId}/submit`, {
                answers,
                timeTaken,
            });
            setResults(res.data);
            setShowingResults(true);
        } catch (error) {
            alert("Failed to submit test");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeUp = () => {
        alert("Time's up! Submitting your test...");
        handleSubmit();
    };

    const navigateQuestion = (index) => {
        setCurrentIndex(index);
    };

    // Configuration Phase
    if (!test && !showingResults) {
        return (
            <Layout title="Mock Test">
                <div className="test-config-card">
                    <h2>Configure Your Test</h2>
                    <p className="text-muted">
                        Customize your mock test settings below
                    </p>

                    <div className="config-form">
                        <div className="form-group">
                            <label className="form-label">Topic</label>
                            <select
                                value={testConfig.topic}
                                onChange={(e) =>
                                    setTestConfig({
                                        ...testConfig,
                                        topic: e.target.value,
                                    })
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

                        <div className="form-group">
                            <label className="form-label">Difficulty</label>
                            <select
                                value={testConfig.difficulty}
                                onChange={(e) =>
                                    setTestConfig({
                                        ...testConfig,
                                        difficulty: e.target.value,
                                    })
                                }
                            >
                                <option value="All">All Levels</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Number of Questions</label>
                            <input
                                type="number"
                                min="5"
                                max="50"
                                value={testConfig.questionCount}
                                onChange={(e) =>
                                    setTestConfig({
                                        ...testConfig,
                                        questionCount: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Duration (minutes)</label>
                            <input
                                type="number"
                                min="10"
                                max="120"
                                value={testConfig.duration}
                                onChange={(e) =>
                                    setTestConfig({
                                        ...testConfig,
                                        duration: parseInt(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={startTest}
                            disabled={loading}
                        >
                            {loading ? "Starting Test..." : "Start Test"}
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Results Phase
    if (showingResults && results) {
        return (
            <Layout title="Test Results">
                <div className="results-card">
                    <div className="results-header">
                        <h2>Test Completed! 🎉</h2>
                        <div className="score-display">
                            <div className="score-circle">
                                <div className="score-value">{results.percentage}%</div>
                            </div>
                            <div className="score-details">
                                <p>
                                    Score: {results.score} / {results.totalMarks}
                                </p>
                                <p>
                                    Time Taken: {Math.floor(results.timeTaken / 60)}m{" "}
                                    {results.timeTaken % 60}s
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/analytics")}
                        >
                            View Analytics
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => window.location.reload()}
                        >
                            Take Another Test
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/dashboard")}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Test Phase
    if (loading) {
        return (
            <Layout title="Mock Test">
                <LoadingSpinner message="Loading test..." />
            </Layout>
        );
    }

    const currentQuestion = test.questions[currentIndex];

    return (
        <Layout title="Mock Test">
            {/* Test Header */}
            <div className="test-header">
                <Timer
                    duration={test.duration * 60}
                    onTimeUp={handleTimeUp}
                    isActive={!showingResults}
                />
                <div className="test-progress">
                    Question {currentIndex + 1} / {test.questions.length}
                </div>
            </div>

            {/* Question Navigator */}
            <div className="question-navigator">
                {test.questions.map((_, index) => (
                    <button
                        key={index}
                        className={`nav-btn ${index === currentIndex ? "active" : ""} ${answers[index] ? "answered" : ""
                            }`}
                        onClick={() => navigateQuestion(index)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Current Question */}
            <QuestionCard
                question={currentQuestion}
                selectedAnswer={answers[currentIndex]}
                onSelectAnswer={handleAnswerSelect}
                showAnswer={false}
            />

            {/* Navigation Buttons */}
            <div className="nav-buttons">
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                >
                    ← Previous
                </button>

                {currentIndex < test.questions.length - 1 ? (
                    <button
                        className="btn btn-primary"
                        onClick={() => setCurrentIndex(currentIndex + 1)}
                    >
                        Next →
                    </button>
                ) : (
                    <button className="btn btn-success" onClick={handleSubmit}>
                        Submit Test
                    </button>
                )}
            </div>
        </Layout>
    );
};

export default MockTest;
