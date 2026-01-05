import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import showToast from "../utils/toast";
import "./Login.css";

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isRegister) {
                // Register
                await API.post("/auth/register", formData);
                showToast.success("Registration successful! Please login.");
                setIsRegister(false);
                setFormData({ ...formData, name: "", password: "" });
            } else {
                // Login
                const res = await API.post("/auth/login", {
                    email: formData.email,
                    password: formData.password,
                });

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

                showToast.success(`Welcome back, ${res.data.user.name}!`);

                // Redirect based on role
                setTimeout(() => {
                    if (res.data.user.role === "admin") {
                        navigate("/admin");
                    } else {
                        navigate("/dashboard");
                    }
                }, 500);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An error occurred";
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>📚 Smart Interview Platform</h1>
                    <p>Prepare for your dream job with AI-powered practice</p>
                </div>

                <div className="login-tabs">
                    <button
                        className={`tab ${!isRegister ? "active" : ""}`}
                        onClick={() => setIsRegister(false)}
                    >
                        Login
                    </button>
                    <button
                        className={`tab ${isRegister ? "active" : ""}`}
                        onClick={() => setIsRegister(true)}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
