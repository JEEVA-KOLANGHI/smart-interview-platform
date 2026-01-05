import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchSmartInsights();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.get("/analytics/overview");
            setStats(res.data);
            // After getting stats, get insights based on them
            // fetchSmartInsights(res.data); // Optional: if we want to pass current stats to AI
        } catch (error) {
            console.error("Failed to fetch stats");
        } finally {
            setLoading(false);
        }
    };

    const fetchSmartInsights = async () => {
        try {
            // We pass an empty history for now, or could pass stats if the endpoint supports it
            // The backend aiController.getSmartInsights expects 'history'
            const res = await API.post("/ai/insights", {
                history: [
                    // Mock history if needed or updated aggregation
                    { topic: "General", score: "Variable" }
                ]
            });
            if (res.data && res.data.tips) {
                setInsights(res.data.tips);
            }
        } catch (error) {
            console.error("Failed to fetch insights");
        } finally {
            setInsightsLoading(false);
        }
    };

    const dashboardCards = [
        {
            title: "Practice Questions",
            description: "Practice questions topic-wise",
            icon: "📝",
            path: "/practice",
            color: "var(--primary)",
        },
        {
            title: "Mock Test",
            description: "Take timed mock tests",
            icon: "⏱️",
            path: "/mock-test",
            color: "var(--secondary)",
        },
        {
            title: "Analytics",
            description: "View your performance",
            icon: "📊",
            path: "/analytics",
            color: "var(--success)",
        },
    ];

    return (
        <Layout title={`Welcome, ${user.name}! 👋`}>
            {/* Stats Cards */}
            {!loading && stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.1)" }}>
                            📚
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalAttempts || 0}</h3>
                            <p>Questions Attempted</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                            ✓
                        </div>
                        <div className="stat-content">
                            <h3>{stats.overallAccuracy || 0}%</h3>
                            <p>Overall Accuracy</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                            🎯
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalTests || 0}</h3>
                            <p>Tests Completed</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "rgba(236, 72, 153, 0.1)" }}>
                            ⭐
                        </div>
                        <div className="stat-content">
                            <h3>{stats.avgTestScore || 0}%</h3>
                            <p>Average Score</p>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Smart Insights */}
            <div className="section-header">
                <h2 className="section-title">🤖 AI Smart Insights</h2>
                {insightsLoading && <span className="loading-badge">Analyzing...</span>}
            </div>

            {!insightsLoading && insights.length > 0 ? (
                <div className="insights-grid">
                    {insights.map((tip, index) => (
                        <div key={index} className="insight-card">
                            <div className="insight-icon">💡</div>
                            <p>{tip}</p>
                        </div>
                    ))}
                </div>
            ) : !insightsLoading && (
                <div className="no-insights">
                    <p>Complete more practice questions to get personalized AI insights!</p>
                </div>
            )}


            {/* Quick Access Cards */}
            <h2 className="section-title">Quick Access</h2>
            <div className="dashboard-grid">
                {dashboardCards.map((card, index) => (
                    <div
                        key={index}
                        className="dashboard-card"
                        onClick={() => navigate(card.path)}
                    >
                        <div className="card-icon" style={{ color: card.color }}>
                            {card.icon}
                        </div>
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                        <button className="btn btn-sm btn-primary">
                            Get Started →
                        </button>
                    </div>
                ))}
            </div>

            {/* Admin Access */}
            {user.role === "admin" && (
                <div className="admin-section">
                    <div className="admin-card" onClick={() => navigate("/admin")}>
                        <div className="card-icon">⚙️</div>
                        <h3>Admin Panel</h3>
                        <p>Manage questions and view all data</p>
                        <button className="btn btn-sm btn-secondary">
                            Go to Admin →
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;
