
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import "../styles/Attendance.css";
import "../styles/StudentProgress.css";

function StudentProgress({ section, student, onClose, accessToken }) {
  const subjects = section.subjects || [];

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest(
          `/attendance/section/${section.id}`,
          { method: "GET" },
          accessToken
        );

        if (isMounted) {
          setAttendanceHistory(response.attendance || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load attendance progress.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (section.id && accessToken) {
      fetchAttendance();
    }

    return () => {
      isMounted = false;
    };
  }, [section.id, accessToken]);

  const studentRecords = useMemo(() => {
    return attendanceHistory
      .flatMap((record) =>
        (record.records || [])
          .filter((item) => {
            const studentId =
              typeof item.student === "object"
                ? item.student?._id
                : item.student;

            return (
              String(studentId) === String(student.id) &&
              ["Present", "Absent"].includes(item.status)
            );
          })
          .map((item) => ({
            subject: record.subject,
            date: new Date(record.date).toISOString().slice(0, 10),
            status: item.status,
          }))
      );
  }, [attendanceHistory, student.id]);

  const totalLectures = studentRecords.length;

  const totalAttended = studentRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const totalMissed = studentRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const overallPercentage =
    totalLectures > 0
      ? Math.round((totalAttended / totalLectures) * 100)
      : 0;

  const subjectReports = subjects.map((subject) => {
    const records = studentRecords.filter(
      (record) =>
        record.subject.trim().toLowerCase() ===
        subject.name.trim().toLowerCase()
    );

    const attended = records.filter(
      (record) => record.status === "Present"
    ).length;

    const missed = records.filter(
      (record) => record.status === "Absent"
    ).length;

    const total = attended + missed;

    return {
      id: subject.id,
      name: subject.name,
      total,
      attended,
      missed,
      percentage:
        total > 0 ? Math.round((attended / total) * 100) : 0,
    };
  });

  const recentRecords = [...studentRecords]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="section-modal student-progress-modal">
          <div className="modal-header">
            <h2>Student Progress</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <p className="progress-empty">Loading student progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="section-modal student-progress-modal">
          <div className="modal-header">
            <h2>Student Progress</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <p className="progress-empty">{error}</p>
          <div className="modal-actions">
            <button className="primary-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="section-modal student-progress-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Student Progress</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="progress-student-info">
          <div>
            <h3>{student.name}</h3>
            <p>Roll Number: {student.rollNumber}</p>
          </div>

          <div className="overall-attendance-card">
            <span>Overall Attendance</span>
            <strong>{overallPercentage}%</strong>
            <small>
              {totalAttended} of {totalLectures} lectures attended
            </small>
          </div>
        </div>

        <div className="progress-summary">
          <div>
            <span>Total Lectures</span>
            <strong>{totalLectures}</strong>
          </div>

          <div>
            <span>Attended</span>
            <strong>{totalAttended}</strong>
          </div>

          <div>
            <span>Missed</span>
            <strong>{totalMissed}</strong>
          </div>
        </div>

        <section className="progress-section">
          <h3>Subject-wise Attendance</h3>

          {subjectReports.length === 0 ? (
            <p className="progress-empty">No subjects available.</p>
          ) : (
            <div className="student-table-wrapper">
              <table className="student-table progress-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Total Lectures</th>
                    <th>Attended</th>
                    <th>Missed</th>
                    <th>Percentage</th>
                  </tr>
                </thead>

                <tbody>
                  {subjectReports.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.name}</td>
                      <td>{subject.total}</td>
                      <td>{subject.attended}</td>
                      <td>{subject.missed}</td>
                      <td>
                        <div className="progress-percentage">
                          <strong>{subject.percentage}%</strong>
                          <div className="progress-bar">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${subject.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="progress-section">
          <h3>Recent Attendance</h3>

          {recentRecords.length === 0 ? (
            <p className="progress-empty">
              No attendance records available yet.
            </p>
          ) : (
            <div className="recent-attendance-list">
              {recentRecords.map((record, index) => (
                <div
                  className="recent-attendance-item"
                  key={`${record.subject}-${record.date}-${index}`}
                >
                  <div>
                    <strong>{record.subject || "Unknown Subject"}</strong>
                    <span>{formatDate(record.date)}</span>
                  </div>

                  <span
                    className={
                      record.status === "Present"
                        ? "record-present-status"
                        : "record-absent-status"
                    }
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="modal-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProgress;
