import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import showToast from "../utils/toast";
import ConfirmDialog from "../components/ConfirmDialog";
import "./Admin.css";

const Admin = () => {
    const [formData, setFormData] = useState({
        title: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        topic: "",
        difficulty: "",
        explanation: "",
    });
    const [questions, setQuestions] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("add"); // add, manage, requests
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        questionId: null,
    });

    useEffect(() => {
        if (activeTab === "manage") {
            fetchQuestions();
        } else if (activeTab === "requests") {
            fetchRequests();
        }
    }, [activeTab]);

    const fetchQuestions = async () => {
        try {
            const res = await API.get("/questions");
            setQuestions(res.data.questions || res.data);
        } catch (error) {
            showToast.error("Failed to fetch questions");
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await API.get("/users/admin-requests");
            setRequests(res.data);
        } catch (error) {
            showToast.error("Failed to fetch admin requests");
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (userId, action) => {
        try {
            await API.post("/users/handle-admin-request", { userId, action });
            showToast.success(`Request ${action}ed successfully`);
            fetchRequests();
        } catch (error) {
            showToast.error(`Failed to ${action} request`);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.options.includes(formData.correctAnswer)) {
            showToast.error("Correct answer must be one of the options");
            return;
        }

        setLoading(true);
        try {
            await API.post("/questions", formData);
            showToast.success("Question added successfully!");
            setFormData({
                title: "",
                options: ["", "", "", ""],
                correctAnswer: "",
                topic: "",
                difficulty: "",
                explanation: "",
            });
            if (activeTab === "manage") {
                fetchQuestions();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to add question";
            showToast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/questions/${id}`);
            showToast.success("Question deleted successfully");
            fetchQuestions();
        } catch (error) {
            showToast.error("Failed to delete question");
        } finally {
            setConfirmDialog({ isOpen: false, questionId: null });
        }
    };

    return (
        <Layout title="Admin Panel">
            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`tab ${activeTab === "add" ? "active" : ""}`}
                    onClick={() => setActiveTab("add")}
                >
                    Add Question
                </button>
                <button
                    className={`tab ${activeTab === "manage" ? "active" : ""}`}
                    onClick={() => setActiveTab("manage")}
                >
                    Manage Questions ({questions.length})
                </button>
                <button
                    className={`tab ${activeTab === "requests" ? "active" : ""}`}
                    onClick={() => setActiveTab("requests")}
                >
                    Admin Requests ({requests.length})
                </button>
            </div>

            {/* Add Question Form */}
            {activeTab === "add" && (
                <div className="admin-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Question Title</label>
                            <textarea
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter question..."
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Options</label>
                            {formData.options.map((opt, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={opt}
                                    onChange={(e) =>
                                        handleOptionChange(index, e.target.value)
                                    }
                                    placeholder={`Option ${index + 1}`}
                                    required
                                />
                            ))}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Correct Answer</label>
                                <select
                                    value={formData.correctAnswer}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            correctAnswer: e.target.value,
                                        })
                                    }
                                    required
                                >
                                    <option value="">Select correct answer</option>
                                    {formData.options.map((opt, index) => (
                                        <option key={index} value={opt}>
                                            {opt || `Option ${index + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Topic</label>
                                <select
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select topic</option>
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
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select difficulty</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                        </div>

                        <div className="form-group">
                            <label className="form-label">Explanation (Optional)</label>
                            <textarea
                                name="explanation"
                                value={formData.explanation}
                                onChange={handleChange}
                                placeholder="Explain why this is the correct answer..."
                                rows="3"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Adding Question..." : "Add Question"}
                        </button>
                    </form>
                </div>
            )}

            {/* Manage Questions */}
            {activeTab === "manage" && (
                <div className="questions-list">
                    {questions.length === 0 ? (
                        <div className="empty-state">
                            <h3>No questions yet</h3>
                            <p>Add some questions to get started</p>
                        </div>
                    ) : (
                        questions.map((q) => (
                            <div key={q._id} className="question-item">
                                <div className="question-header">
                                    <div className="question-badges">
                                        <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>
                                            {q.difficulty}
                                        </span>
                                        <span className="badge badge-primary">
                                            {q.topic}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-delete"
                                        onClick={() =>
                                            setConfirmDialog({
                                                isOpen: true,
                                                questionId: q._id,
                                            })
                                        }
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <h4>{q.title}</h4>
                                <ul className="options-preview">
                                    {q.options?.map((opt, idx) => (
                                        <li
                                            key={idx}
                                            className={
                                                opt === q.correctAnswer
                                                    ? "correct-option"
                                                    : ""
                                            }
                                        >
                                            {opt}
                                            {opt === q.correctAnswer && " ✓"}
                                        </li>
                                    ))}
                                </ul>
                                {q.explanation && (
                                    <div className="explanation-box">
                                        <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Admin Requests */}
            {activeTab === "requests" && (
                <div className="requests-list">
                    {loading ? (
                        <div className="empty-state">
                            <p>Loading requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="empty-state">
                            <h3>No pending requests</h3>
                            <p>All admin access requests have been processed.</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div key={req._id} className="request-item">
                                <div className="request-info">
                                    <h4>{req.name}</h4>
                                    <p>{req.email}</p>
                                    <small>Requested on: {new Date(req.createdAt).toLocaleDateString()}</small>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleRequest(req._id, "approve")}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRequest(req._id, "reject")}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                onConfirm={() => handleDelete(confirmDialog.questionId)}
                onCancel={() => setConfirmDialog({ isOpen: false, questionId: null })}
                confirmText="Delete"
                type="danger"
            />
        </Layout>
    );
};

export default Admin;
