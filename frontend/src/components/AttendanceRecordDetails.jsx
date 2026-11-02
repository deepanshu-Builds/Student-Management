
import "../styles/Attendance.css";

function AttendanceRecordDetails({ section, record, onBack }) {
  const subject = (section.subjects || []).find(
    (item) =>
      item.id === record.subjectId ||
      item.name === record.subject
  );

  const students = section.students || [];

  const getStudent = (item) => {
    const studentId =
      typeof item.student === "object"
        ? item.student?._id
        : item.student || item.studentId;

    return (
      students.find((student) => student.id === studentId) ||
      (typeof item.student === "object"
        ? {
            id: item.student._id,
            name: item.student.name,
            rollNumber: item.student.rollNumber,
          }
        : null)
    );
  };

  const presentStudents = (record.records || [])
    .filter((item) => item.status === "Present")
    .map(getStudent)
    .filter(Boolean);

  const absentStudents = (record.records || [])
    .filter((item) => item.status === "Absent")
    .map(getStudent)
    .filter(Boolean);

  return (
    <div className="attendance-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Attendance
      </button>

      <div className="attendance-header">
        <div>
          <div className="attendance-section">
            <h1>Attendance Details</h1>
            <h2>{section.name}</h2>
          </div>

          <span className="section-year">
            ACADEMIC YEAR {section.year}
          </span>
        </div>
      </div>

      <section className="attendance-filter-card">
        <div className="attendance-filter-heading">
          <h2>{subject?.name || record.subject || "Unknown Subject"}</h2>
          <p>Attendance Date: {record.date}</p>
        </div>
      </section>

      <div className="attendance-summary">
        <div>
          <span>Total Students</span>
          <strong>{record.records?.length || 0}</strong>
        </div>

        <div>
          <span>Present</span>
          <strong>{presentStudents.length}</strong>
        </div>

        <div>
          <span>Absent</span>
          <strong>{absentStudents.length}</strong>
        </div>
      </div>

      <section className="attendance-roster-section">
        <div className="attendance-roster-header">
          <h2>Present Students</h2>
          <span className="attendance-count">
            {presentStudents.length} students
          </span>
        </div>

        {presentStudents.length === 0 ? (
          <div className="attendance-empty-state">
            <p>No students were marked present.</p>
          </div>
        ) : (
          <div className="student-table-wrapper">
            <table className="student-table attendance-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {presentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.name}</td>
                    <td className="record-present-status">Present</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="attendance-roster-section">
        <div className="attendance-roster-header">
          <h2>Absent Students</h2>
          <span className="attendance-count">
            {absentStudents.length} students
          </span>
        </div>

        {absentStudents.length === 0 ? (
          <div className="attendance-empty-state">
            <p>No students were marked absent.</p>
          </div>
        ) : (
          <div className="student-table-wrapper">
            <table className="student-table attendance-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {absentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.name}</td>
                    <td className="record-absent-status">Absent</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AttendanceRecordDetails;
