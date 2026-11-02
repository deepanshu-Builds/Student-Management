
import React from "react";
import "../styles/InfoPages.css";

function About() {
  const features = [
    { icon: "♟", title: "Student Management" },
    { icon: "▦", title: "Attendance Tracking" },
    { icon: "↗", title: "Progress Analytics" },
    { icon: "✓", title: "Secure & Reliable" },
  ];

  return (
    <main className="info-page">
      <section className="info-hero">
        <span className="info-eyebrow">ACADEMIA PULSE</span>
        <h1>About Academia Pulse</h1>
        <p>Empowering Education Through Smart Management</p>
        <span className="hero-line" />
      </section>

      <section className="about-card">
        <div className="mission-section">
          <div className="about-illustration">♟</div>
          <div>
            <h2>Our Mission</h2>
            <p>
              To simplify academic management and create a smarter,
              more organized educational environment for teachers
              and students.
            </p>
          </div>
        </div>

        <div className="about-description">
          <div>
            <h2>What is Academia Pulse?</h2>
            <span className="section-line" />
            <p>
              Academia Pulse is a modern Student Management System
              designed to help educational institutions manage student
              information, track attendance, and monitor academic
              progress — all in one place.
            </p>
          </div>
          <div className="books-illustration">▤</div>
        </div>

        <div className="highlights-section">
          <h2>Key Highlights</h2>
          <div className="feature-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <span>{feature.icon}</span>
                <h3>{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="about-footer">
          <span>★</span>
          <div>
            <h3>Built for Better Education</h3>
            <p>Because every student's progress matters.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
