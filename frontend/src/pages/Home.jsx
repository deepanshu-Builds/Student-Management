
import { useState } from "react";
import SectionForm from "../components/SectionForm";
import "../styles/Home.css";

function Home({ sections, onCreateSection, onOpenSection }) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const handleCreateSection = async (newSection) => {
    const duplicate = sections.some(
      (section) =>
        section.year === newSection.year &&
        section.name.toLowerCase() === newSection.name.toLowerCase()
    );

    if (duplicate) {
      setError("This section already exists in this academic year.");
      return false;
    }

    const success = await onCreateSection(newSection);

    if (success) {
      setShowForm(false);
      setError("");
      return true;
    }

    return false;
  };

  const totalStudents = sections.reduce(
    (total, section) => total + section.students.length,
    0
  );

  const totalSubjects = sections.reduce(
    (total, section) => total + section.subjects.length,
    0
  );

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <h1 className="section">Records</h1>
        </div>

        <button
          className="primary-btn create-section-btn"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          + Create Section
        </button>
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <span>Total Sections</span>
          <strong>{sections.length}</strong>
        </div>

        <div className="overview-card">
          <span>Total Students</span>
          <strong>{totalStudents}</strong>
        </div>

        <div className="overview-card">
          <span>Total Subjects</span>
          <strong>{totalSubjects}</strong>
        </div>
      </div>

      <section className="sections-section">
        <div className="section-list-header">
          <h2>All Sections</h2>
        </div>

        {error && <p className="form-error">{error}</p>}

        {sections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">+</div>

            <h3>No sections created</h3>

            <p>
              Create an academic section to start adding subjects
              and managing students.
            </p>

            <button
              className="primary-btn"
              onClick={() => setShowForm(true)}
            >
              Create Your First Section
            </button>
          </div>
        ) : (
          <div className="section-grid">
            {sections.map((section) => (
              <article className="section-card" key={section.id}>
                <div className="section-card-header">
                  <div className="year-section">
                    <h3>{section.name}</h3>
                    <span className="section-year">
                      YEAR {section.year}
                    </span>
                  </div>
                </div>

                <div className="section-card-info">
                  <div>
                    <span>Students</span>
                    <strong>{section.students.length}</strong>
                  </div>

                  <div>
                    <span>Subjects</span>
                    <strong>{section.subjects.length}</strong>
                  </div>
                </div>

                <div className="section-subject-preview">
                  {section.subjects.slice(0, 3).map((subject) => (
                    <span key={subject.id}>
                      {subject.name}
                    </span>
                  ))}

                  {section.subjects.length > 3 && (
                    <span>
                      +{section.subjects.length - 3} more
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="view-section-btn"
                  onClick={() => onOpenSection(section.id)}
                >
                  View Section
                  <span>→</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <SectionForm
          onCreate={handleCreateSection}
          onClose={() => {
            if (!showForm) return;
            setShowForm(false);
            setError("");
          }}
        />
      )}
    </div>
  );
}

export default Home;
