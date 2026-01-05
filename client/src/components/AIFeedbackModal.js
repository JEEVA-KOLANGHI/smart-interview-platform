import React from "react";
import "./AIFeedbackModal.css";

const AIFeedbackModal = ({ isOpen, onClose, feedback, loading }) => {
    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content loading">
                    <div className="ai-spinner"></div>
                    <p>AI is analyzing your code...</p>
                </div>
            </div>
        );
    }

    if (!feedback) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content ai-feedback-modal">
                <div className="modal-header">
                    <h2>🤖 AI Code Coach</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="score-section">
                        <div className="score-card">
                            <span className="label">Quality Score</span>
                            <div className={`score-value ${feedback.qualityScore >= 80 ? 'high' : feedback.qualityScore >= 50 ? 'medium' : 'low'}`}>
                                {feedback.qualityScore}/100
                            </div>
                        </div>
                        <div className="complexity-card">
                            <span className="label">Time Complexity</span>
                            <span className="value">{feedback.timeComplexity}</span>
                        </div>
                        <div className="complexity-card">
                            <span className="label">Space Complexity</span>
                            <span className="value">{feedback.spaceComplexity}</span>
                        </div>
                    </div>

                    <div className="feedback-section">
                        <h3>Analysis</h3>
                        <p className="main-feedback">{feedback.feedback}</p>

                        {feedback.suggestions && feedback.suggestions.length > 0 && (
                            <div className="suggestions">
                                <h4>💡 Suggestions for Improvement</h4>
                                <ul>
                                    {feedback.suggestions.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {feedback.optimizedCode && (
                            <div className="optimized-code">
                                <h4>🚀 Optimized Approach</h4>
                                <pre><code>{feedback.optimizedCode}</code></pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIFeedbackModal;
