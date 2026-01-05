import { useNavigate } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children, title }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="layout">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <h2>📚 Smart Interview</h2>
                    </div>
                    <div className="navbar-menu">
                        <button className="nav-link" onClick={() => navigate("/dashboard")}>
                            Dashboard
                        </button>
                        <button className="nav-link" onClick={() => navigate("/practice")}>
                            Practice
                        </button>
                        <button className="nav-link" onClick={() => navigate("/mock-test")}>
                            Mock Test
                        </button>
                        <button className="nav-link" onClick={() => navigate("/analytics")}>
                            Analytics
                        </button>
                        <button className="nav-link" onClick={() => navigate("/profile")}>
                            Profile
                        </button>
                        {user.role === "admin" && (
                            <button className="nav-link" onClick={() => navigate("/admin")}>
                                Admin
                            </button>
                        )}
                        <button className="nav-link logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <main className="main-content">
                {title && <h1 className="page-title">{title}</h1>}
                {children}
            </main>
        </div>
    );
};

export default Layout;
