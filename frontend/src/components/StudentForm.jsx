
import { useEffect, useState } from "react";

function StudentForm({ student, onSave, onClose }) {
  const [name, setName] = useState(student?.name || "");
  const [rollNumber, setRollNumber] = useState(
    student?.rollNumber || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(student?.name || "");
    setRollNumber(student?.rollNumber || "");
    setError("");
  }, [student]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanRollNumber = rollNumber.trim();

    if (!cleanName || !cleanRollNumber) {
      setError("Please enter both student name and roll number.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const saveError = await onSave({
        name: cleanName,
        rollNumber: cleanRollNumber
      });

      if (saveError) {
        setError(saveError);
      }
    } catch (error) {
      setError(error.message || "Unable to save student.");
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
            <h2>{student ? "Edit Student" : "Add Student"}</h2>
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
            <label htmlFor="student-name">Student Name</label>
            <input
              id="student-name"
              type="text"
              placeholder="Enter Student Name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              maxLength={100}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="roll-number">Roll Number</label>
            <input
              id="roll-number"
              type="text"
              placeholder="Enter Roll Number"
              value={rollNumber}
              onChange={(event) => {
                setRollNumber(event.target.value);
                setError("");
              }}
              maxLength={30}
              disabled={loading || Boolean(student)}
            />
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
              {loading
                ? "Saving..."
                : student
                  ? "Save Changes"
                  : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentForm;
