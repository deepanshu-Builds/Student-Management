
import { useState } from "react";
import { apiRequest } from "../services/api";
import "../styles/Loginpage.css";

function LoginPage({ onNavigate, onLogin }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const loginData = {
            email: formData.get("email").trim(),
            password: formData.get("password"),
        };

        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/auth/login", {
                method: "POST",
                data: loginData,
            });

            if (!data.accessToken) {
                throw new Error("Access token was not received.");
            }

            // Send token and user details to App
            onLogin(data);

        } catch (error) {
            setError(
                error.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-background">
                <div className="login-orbit login-orbit-one"></div>
                <div className="login-orbit login-orbit-two"></div>
                <div className="login-glow login-glow-one"></div>
                <div className="login-glow login-glow-two"></div>
            </div>

            <a
                href="/"
                className="login-brand"
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate("landing");
                }}
            >
                <span>ACADEMIA PULSE</span>
            </a>

            <section className="login-container">
                <div className="login-card">

                    <div className="login-heading">
                        <h1>Log in to your account</h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >
                        <div className="login-field">
                            <label htmlFor="email">Email</label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Password</label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="login-error"
                            >
                                {error}
                            </p>
                        )}

                        <div className="login-options">
                            <label className="remember-option">
                                <input
                                    type="checkbox"
                                    name="remember"
                                />
                                <span>Remember me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Log in"}
                        </button>
                    </form>

                    <div className="login-footer">
                        <span>Don't have an account?</span>

                        <a
                            href="/signup"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate("signup");
                            }}
                        >
                            Create Account
                        </a>
                    </div>

                </div>
            </section>
        </main>
    );
}

export default LoginPage;
