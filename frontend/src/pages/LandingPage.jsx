
import "../styles/LandingPage.css";

function GraduationCap() {
  return (
    <svg
      className="brand-cap"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 25L60 3L116 25L60 48L4 25Z" fill="#F5E8CC" />

      <path
        d="M25 34V51C25 61 41 70 60 70C79 70 95 61 95 51V34L60 49L25 34Z"
        fill="#F5E8CC"
      />

      <path
        d="M116 25V54"
        stroke="#F5E8CC"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="116" cy="57" r="4" fill="#F5E8CC" />
    </svg>
  );
}

function LandingPage({ onLogin, onSignup }) {
  return (
    <main className="landing-page">
      {/* Background Design */}
      <div className="background-design">
        <div className="bg-orbit bg-orbit-one"></div>
        <div className="bg-orbit bg-orbit-two"></div>

        <div className="bg-glow bg-glow-one"></div>
        <div className="bg-glow bg-glow-two"></div>

        <div className="bg-circle bg-circle-one"></div>
        <div className="bg-circle bg-circle-two"></div>
      </div>

      {/* Navbar */}
      <header className="landing-navbar">
        <button
          type="button"
          className="brand-name"
          onClick={() => window.location.reload()}
        >
          <GraduationCap />
          <span>ACADEMIA PULSE</span>
        </button>

        <nav className="nav-actions">
          <button
            type="button"
            className="login-btn"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            type="button"
            className="signup-btn"
            onClick={onSignup}
          >
            Sign Up
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>ACADEMIA PULSE</h1>

          <div className="hero-tagline">
            <span className="tagline-line"></span>

            <p>Make the management easy.</p>

            <span className="tagline-line"></span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
