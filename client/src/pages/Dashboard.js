import "../components/Card.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>Dashboard</h2>

            <div className="card">
                <p>Welcome to Smart Interview Preparation Platform</p>

                <button onClick={() => navigate("/practice")}>Practice</button>
                <br /><br />

                <button onClick={() => navigate("/mock-test")}>Mock Test</button>
                <br /><br />

                <button onClick={() => navigate("/analytics")}>Analytics</button>
                <br /><br />

                <button onClick={() => navigate("/admin")}>Admin Panel</button>
                <br /><br />

                <button onClick={logout} style={{ backgroundColor: "#dc2626" }}>
                    Logout
                </button>
            </div>
        </div>

    );
};

export default Dashboard;
