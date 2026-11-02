
import { useState } from "react";
import { apiRequest } from "../services/api";
import "../styles/SignupPage.css";

function SignupPage({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save form reference before async API request
    const form = e.currentTarget;

    setError("");
    setSuccess("");

    const formData = new FormData(form);

    const userData = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      employeeId: formData.get("employeeId").trim(),
      department: formData.get("department").trim(),
      password: formData.get("password")
    };

    try {
      setLoading(true);

      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
      });

      setSuccess(
        data.message || "Account created successfully."
      );

      // Reset form safely
      form.reset();

      setTimeout(() => {
        onNavigate("login");
      }, 1000);

    } catch (error) {
      setError(
        error.message || "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-background">
        <div className="signup-orbit signup-orbit-one"></div>
        <div className="signup-orbit signup-orbit-two"></div>
        <div className="signup-glow signup-glow-one"></div>
        <div className="signup-glow signup-glow-two"></div>
      </div>

      <a
        href="/"
        className="signup-brand"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("landing");
        }}
      >
        <span>ACADEMIA PULSE</span>
      </a>

      <section className="signup-container">
        <div className="signup-card">
          <div className="signup-heading">
            <h1>Create your account</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="signup-form"
          >
            <div className="signup-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="name"
                autoComplete="name"
                minLength="2"
                maxLength="50"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signupEmail">Email</label>
              <input
                type="email"
                id="signupEmail"
                name="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="employeeId">Employee ID</label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                minLength="3"
                maxLength="30"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signupPassword">Password</label>
              <input
                type="password"
                id="signupPassword"
                name="password"
                autoComplete="new-password"
                minLength="8"
                required
              />
            </div>

            {error && (
              <p role="alert" className="signup-error">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="signup-success">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="signup-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <div className="signup-footer">
            <span>Already have an account?</span>

            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("login");
              }}
            >
              Sign In
            </a>
          </div>
        </div>

        <p className="signup-bottom-text">
          A smarter way to manage your academics.
        </p>
      </section>
    </main>
  );
}

export default SignupPage;
