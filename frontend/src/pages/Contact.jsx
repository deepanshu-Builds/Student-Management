
import React, { useState } from "react";
import "../styles/InfoPages.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent("Academia Pulse Contact");
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    window.location.href =
      `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="info-page">
      <section className="info-hero">
        <span className="info-eyebrow">WE'D LOVE TO HEAR FROM YOU</span>
        <h1>Contact Us</h1>
        <p>We're here to help and answer your queries</p>
        <span className="hero-line" />
      </section>

      <section className="contact-card">
        <div className="contact-details">
          <h2>Get in Touch</h2>
          <span className="section-line" />
          <p>
            Have any questions, suggestions, or need support?
            Feel free to reach out to us.
          </p>

          <div className="contact-item">
            <span className="contact-icon">@</span>
            <div>
              <h3>Email</h3>
              <p>deepanshu1580@gmail.com</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">☎</span>
            <div>
              <h3>Phone</h3>
              <p>8218470562</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">⌖</span>
            <div>
              <h3>Location</h3>
              <p>India</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send a Message</h2>
          <span className="section-line" />

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          />

          <button type="submit">Send Message →</button>
        </form>
      </section>

      <div className="contact-footer">
        <span>↗</span>
        <div>
          <h3>Let's Build a Smarter Learning Future Together</h3>
          <p>Your feedback helps us improve.</p>
        </div>
      </div>
    </main>
  );
}

export default Contact;
