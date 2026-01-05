import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import API from "../services/api";
import "./Analytics.css";

const Analytics = () => {
    const [overview, setOverview] = useState(null);
    const [topicPerformance, setTopicPerformance] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewRes, topicRes, insightsRes] = await Promise.all([
                API.get("/analytics/overview"),
                API.get("/analytics/topic-performance"),
                API.get("/analytics/insights"),
            ]);

            setOverview(overviewRes.data);
            setTopicPerformance(topicRes.data);
            setInsights(insightsRes.data);
        } catch (error) {
            console.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Analytics">
                <LoadingSpinner message="Loading analytics..." />
            </Layout>
        );
    }

    return (
        <Layout title="Performance Analytics">
            {/* Overview Stats */}
            {overview && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                            <h3>{overview.totalAttempts}</h3>
                            <p>Total Attempts</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✓</div>
                        <div className="stat-content">
                            <h3>{overview.overallAccuracy}%</h3>
                            <p>Overall Accuracy</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <h3>{overview.totalTests}</h3>
                            <p>Tests Completed</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                            <h3>{overview.avgTestScore}%</h3>
                            <p>Avg Test Score</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
                <div className="insights-section">
                    <h2>Smart Insights</h2>
                    <div className="insights-grid">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`insight-card ${insight.type}`}
                            >
                                <div className="insight-icon">
                                    {insight.type === "success" && "✓"}
                                    {insight.type === "warning" && "⚠️"}
                                    {insight.type === "info" && "ℹ️"}
                                    {insight.type === "tip" && "💡"}
                                </div>
                                <p>{insight.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Topic Performance */}
            {topicPerformance.length > 0 && (
                <div className="performance-section">
                    <h2>Topic-wise Performance</h2>
                    <div className="performance-grid">
                        {topicPerformance.map((topic) => (
                            <div key={topic.topic} className="performance-card">
                                <div className="performance-header">
                                    <h3>{topic.topic}</h3>
                                    <span className="accuracy-badge">
                                        {topic.accuracy}%
                                    </span>
                                </div>
                                <div className="performance-bar">
                                    <div
                                        className="performance-fill"
                                        style={{
                                            width: `${topic.accuracy}%`,
                                            background:
                                                topic.accuracy >= 80
                                                    ? "var(--success)"
                                                    : topic.accuracy >= 60
                                                        ? "var(--warning)"
                                                        : "var(--danger)",
                                        }}
                                    ></div>
                                </div>
                                <div className="performance-stats">
                                    <span>
                                        {topic.correct} / {topic.attempts} correct
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && overview?.totalAttempts === 0 && (
                <div className="empty-state">
                    <h3>No Data Available</h3>
                    <p>
                        Start practicing questions or take mock tests to see your
                        analytics here.
                    </p>
                </div>
            )}
        </Layout>
    );
};

export default Analytics;
