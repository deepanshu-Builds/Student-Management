
import { useState } from "react";
import "../styles/Section.css";

function SectionForm({ onCreate, onClose }) {
  const [year, setYear] = useState("1");
  const [sectionName, setSectionName] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addSubject = () => {
    const subjectName = subjectInput.trim();

    if (!subjectName) {
      setError("Please enter a subject name.");
      return;
    }

    const alreadyExists = subjects.some(
      (subject) =>
        subject.toLowerCase() === subjectName.toLowerCase()
    );

    if (alreadyExists) {
      setError("This subject has already been added.");
      return;
    }

    setSubjects((previous) => [...previous, subjectName]);
    setSubjectInput("");
    setError("");
  };

  const removeSubject = (subjectToRemove) => {
    setSubjects((previous) =>
      previous.filter((subject) => subject !== subjectToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanName = sectionName.trim();

    if (!year || !cleanName) {
      setError("Please select an academic year and enter a section name.");
      return;
    }

    if (subjects.length === 0) {
      setError("Please add at least one subject.");
      return;
    }

    try {
      setLoading(true);

      const result = await onCreate({
        name: cleanName,
        year: Number(year),
        subjects: subjects.map((subject) => ({
          name: subject
        })),
        students: [],
        attendance: []
      });

      if (!result) {
        setError("Unable to create section. Please try again.");
      }
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="section-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Create Section</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="academic-year">Academic Year</label>

            <select
              id="academic-year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              disabled={loading}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="section-name">Section Name</label>

            <input
              id="section-name"
              type="text"
              placeholder="Section-A"
              value={sectionName}
              onChange={(event) => setSectionName(event.target.value)}
              maxLength={40}
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="subject-name">Subjects</label>

            <div className="subject-input-row">
              <input
                id="subject-name"
                type="text"
                placeholder="Enter Subjects Name"
                value={subjectInput}
                disabled={loading}
                onChange={(event) => {
                  setSubjectInput(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSubject();
                  }
                }}
              />

              <button
                type="button"
                className="add-subject-btn"
                onClick={addSubject}
                disabled={loading}
              >
                Add
              </button>
            </div>

            {subjects.length > 0 && (
              <div className="subject-list">
                {subjects.map((subject) => (
                  <div className="subject-chip" key={subject}>
                    <span>{subject}</span>

                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      aria-label={`Remove ${subject}`}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SectionForm;
