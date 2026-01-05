import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";
import API from "../services/api";
import showToast from "../utils/toast";
import "./Profile.css";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [incompleteTests, setIncompleteTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        testId: null,
    });

    useEffect(() => {
        fetchProfile();
        fetchIncompleteTests();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await API.get("/users/profile");
            setProfile(res.data.user);
        } catch (error) {
            showToast.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchIncompleteTests = async () => {
        try {
            const res = await API.get("/users/incomplete-tests");
            setIncompleteTests(res.data);
        } catch (error) {
            showToast.error("Failed to fetch incomplete tests");
        }
    };

    const handleDeleteTest = async (testId) => {
        try {
            await API.delete(`/users/incomplete-tests/${testId}`);
            showToast.success("Incomplete test deleted");
            fetchIncompleteTests();
        } catch (error) {
            showToast.error("Failed to delete test");
        }
    };

    const handleRequestAdmin = async () => {
        setLoading(true);
        try {
            const res = await API.post("/users/request-admin");
            showToast.success(res.data.message);
            fetchProfile(); // Refresh profile to show new status
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to submit request";
            showToast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout title="My Profile">
                <LoadingSpinner message="Loading profile..." />
            </Layout>
        );
    }

    return (
        <Layout title="My Profile">
            {/* User Info */}
            {profile && (
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <h2>{profile.name}</h2>
                            <p>{profile.email}</p>
                            <div className="profile-badges">
                                <span className={`role-badge role-${profile.role}`}>
                                    {profile.role}
                                </span>
                                {profile.role !== "admin" && profile.roleRequestStatus !== "none" && (
                                    <span className={`status-badge status-${profile.roleRequestStatus}`}>
                                        Request: {profile.roleRequestStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Request Section */}
                    {profile.role !== "admin" && (
                        <div className="admin-request-box">
                            {profile.roleRequestStatus === "none" || profile.roleRequestStatus === "rejected" ? (
                                <>
                                    <p>Want to contribute? Request admin access to add and manage questions.</p>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleRequestAdmin}
                                        disabled={loading}
                                    >
                                        {profile.roleRequestStatus === "rejected" ? "Re-request Admin Access" : "Request Admin Access"}
                                    </button>
                                </>
                            ) : profile.roleRequestStatus === "pending" ? (
                                <p className="status-message info">
                                    🕒 Your request for admin access is currently pending review.
                                </p>
                            ) : null}
                        </div>
                    )}
                </div>
            )}

            {/* Incomplete Tests Warning */}
            {incompleteTests.length > 0 && (
                <div className="incomplete-tests-section">
                    <h2>⚠️ Incomplete Tests ({incompleteTests.length})</h2>
                    <p className="text-muted">
                        You have started these tests but haven't completed them.
                        You can delete them to clean up.
                    </p>

                    <div className="incomplete-tests-list">
                        {incompleteTests.map((test) => (
                            <div key={test._id} className="incomplete-test-card">
                                <div className="test-details">
                                    <h4>
                                        {test.topic} - {test.difficulty}
                                    </h4>
                                    <p className="test-date">
                                        Started:{" "}
                                        {new Date(test.createdAt).toLocaleString()}
                                    </p>
                                    <p className="test-duration">
                                        Duration: {test.duration} minutes
                                    </p>
                                </div>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                        setConfirmDialog({
                                            isOpen: true,
                                            testId: test._id,
                                        })
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bookmarked Questions */}
            {profile?.bookmarkedQuestions?.length > 0 && (
                <div className="bookmarks-section">
                    <h2>📌 Bookmarked Questions ({profile.bookmarkedQuestions.length})</h2>
                    <div className="bookmarks-grid">
                        {profile.bookmarkedQuestions.map((q) => (
                            <div key={q._id} className="bookmark-card">
                                <div className="bookmark-badges">
                                    <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>
                                        {q.difficulty}
                                    </span>
                                    <span className="badge badge-primary">{q.topic}</span>
                                </div>
                                <p>{q.title}</p>
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn btn-primary mt-2"
                        onClick={() => navigate("/practice")}
                    >
                        Practice Bookmarked Questions
                    </button>
                </div>
            )}

            {/* Stats */}
            {profile?.attemptedQuestions?.length > 0 && (
                <div className="attempts-section">
                    <h2>📊 Recent Activity</h2>
                    <p>You've attempted {profile.attemptedQuestions.length} questions</p>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Incomplete Test"
                message="Are you sure you want to delete this incomplete test? This action cannot be undone."
                onConfirm={() => handleDeleteTest(confirmDialog.testId)}
                onCancel={() => setConfirmDialog({ isOpen: false, testId: null })}
                confirmText="Delete"
                type="danger"
            />
        </Layout>
    );
};

export default Profile;
