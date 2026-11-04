
import { useEffect, useState } from "react";
import AttendanceRecordDetails from "./AttendanceRecordDetails";
import { apiRequest } from "../services/api";
import "../styles/Attendance.css";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

// Supports both frontend id and MongoDB _id
function getSubjectId(subject) {
  return subject?.id?.toString() || subject?._id?.toString() || "";
}

function getStudentId(student) {
  return student?.id?.toString() || student?._id?.toString() || "";
}

function normalizeRecord(record, subjects) {
  const subject = subjects.find(
    (item) => item.name === record.subject
  );

  return {
    id: record._id,
    subjectId: subject ? getSubjectId(subject) : "",
    subject: record.subject,
    date: formatDate(record.date),
    records: (record.records || []).map((item) => ({
      studentId:
        item.student?._id?.toString() ||
        item.student?.id?.toString() ||
        item.student?.toString(),
      student: item.student,
      status: item.status,
    })),
  };
}

function Attendance({ section, onBack, accessToken }) {
  const students = section.students || [];
  const subjects = section.subjects || [];

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [subjectId, setSubjectId] = useState(
    getSubjectId(subjects[0])
  );
  const [date, setDate] = useState(getTodayDate());
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);

  // Keep subject selection valid when section subjects load or change
  useEffect(() => {
    if (!subjects.length) {
      setSubjectId("");
      return;
    }

    const currentSubjectExists = subjects.some(
      (subject) => getSubjectId(subject) === subjectId
    );

    if (!currentSubjectExists) {
      setSubjectId(getSubjectId(subjects[0]));
    }
  }, [subjects, subjectId]);

  // Fetch all attendance records of this section
  useEffect(() => {
    let isMounted = true;

    const fetchAttendanceHistory = async () => {
      try {
        setLoadingHistory(true);
        setError("");

        const response = await apiRequest(
          `/attendance/section/${section.id}`,
          { method: "GET" },
          accessToken
        );

        if (isMounted) {
          const records = (response.attendance || []).map((record) =>
            normalizeRecord(record, subjects)
          );

          setAttendanceHistory(records);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load attendance history.");
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    if (section.id && accessToken) {
      fetchAttendanceHistory();
    } else {
      setLoadingHistory(false);
    }

    return () => {
      isMounted = false;
    };
  }, [section.id, accessToken]);

  // Load saved attendance whenever subject/date changes
  useEffect(() => {
    const existingRecord = attendanceHistory.find(
      (record) =>
        record.subjectId === subjectId && record.date === date
    );

    const savedRecords = {};

    existingRecord?.records?.forEach((record) => {
      savedRecords[record.studentId] = record.status;
    });

    setAttendance(savedRecords);
    setMessage("");
  }, [subjectId, date, attendanceHistory]);

  const markStudent = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));

    setMessage("");
    setError("");
  };

  const markAll = (status) => {
    const updatedAttendance = {};

    students.forEach((student) => {
      const studentId = getStudentId(student);

      if (studentId) {
        updatedAttendance[studentId] = status;
      }
    });

    setAttendance(updatedAttendance);
    setMessage("");
    setError("");
  };

  const handleSave = async () => {
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (!date) {
      setError("Please select an attendance date.");
      return;
    }

    if (students.length === 0) {
      setError("Add students to this section before marking attendance.");
      return;
    }

    const allMarked = students.every((student) => {
      const studentId = getStudentId(student);
      return studentId && attendance[studentId];
    });

    if (!allMarked) {
      setError("Please mark attendance for every student.");
      return;
    }

    const selectedSubject = subjects.find(
      (subject) => getSubjectId(subject) === subjectId
    );

    if (!selectedSubject) {
      setError("Invalid subject selected.");
      return;
    }

    const records = students.map((student) => {
      const studentId = getStudentId(student);

      return {
        student: studentId,
        status: attendance[studentId],
      };
    });

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await apiRequest(
        "/attendance",
        {
          method: "POST",
          body: JSON.stringify({
            sectionId: section.id,
            subject: selectedSubject.name,
            date,
            records,
          }),
        },
        accessToken
      );

      const savedRecord = normalizeRecord(
        response.attendance,
        subjects
      );

      setAttendanceHistory((previous) => {
        const filtered = previous.filter(
          (record) =>
            !(
              record.subject === savedRecord.subject &&
              record.date === savedRecord.date
            )
        );

        return [savedRecord, ...filtered].sort(
          (a, b) => b.date.localeCompare(a.date)
        );
      });

      setMessage(response.message || "Attendance saved successfully.");
    } catch (err) {
      console.error("Attendance Save Error:", err);
      setError(err.message || "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const selectedSubject = subjects.find(
    (subject) => getSubjectId(subject) === subjectId
  );

  const presentCount = students.filter((student) => {
    const studentId = getStudentId(student);
    return attendance[studentId] === "Present";
  }).length;

  const absentCount = students.filter((student) => {
    const studentId = getStudentId(student);
    return attendance[studentId] === "Absent";
  }).length;

  const markedCount = presentCount + absentCount;

  const sortedHistory = [...attendanceHistory].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  const openHistoryRecord = (record) => {
    setSelectedHistoryRecord(record);
  };

  if (selectedHistoryRecord) {
    return (
      <AttendanceRecordDetails
        section={section}
        record={selectedHistoryRecord}
        onBack={() => setSelectedHistoryRecord(null)}
      />
    );
  }

  return (
    <div className="attendance-page">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Back to Section
      </button>

      <div className="attendance-header">
        <div>
          <div className="attendance-section">
            <h1>Attendance</h1>
            <h2>{section.name}</h2>
          </div>

          <span className="section-year">
            ACADEMIC YEAR {section.year}
          </span>
        </div>
      </div>

      <section className="attendance-filter-card">
        <div className="attendance-filter-heading">
          <h2>Select a subject and date to mark attendance.</h2>
        </div>

        <div className="attendance-filter-grid">
          <div className="form-field">
            <label htmlFor="attendance-subject">Subject</label>

            <select
              id="attendance-subject"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              <option value="">Select subject</option>

              {subjects.map((subject) => {
                const id = getSubjectId(subject);

                return (
                  <option key={id} value={id}>
                    {subject.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="attendance-date">Attendance Date</label>

            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              max={getTodayDate()}
            />
          </div>
        </div>
      </section>

      <section className="attendance-roster-section">
        <div className="attendance-roster-header">
          <div>
            <h2>Attendance Overview</h2>
            <p>
              {selectedSubject?.name || "Select subject"} · {date}
            </p>
          </div>

          <span className="attendance-count">
            {markedCount}/{students.length} marked
          </span>
        </div>

        {students.length === 0 ? (
          <div className="attendance-empty-state">
            <h3>No students available</h3>
           
          </div>
        ) : (
          <>
            <div className="attendance-summary">
              <div>
                <span>Present</span>
                <strong>{presentCount}</strong>
              </div>

              <div>
                <span>Absent</span>
                <strong>{absentCount}</strong>
              </div>

              <div>
                <span>Not Marked</span>
                <strong>{students.length - markedCount}</strong>
              </div>
            </div>

            <div className="attendance-bulk-actions">
              <span>Quick Actions</span>

              <button
                type="button"
                className="mark-all-present"
                onClick={() => markAll("Present")}
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={() => markAll("Absent")}
              >
                Mark All Absent
              </button>
            </div>

            <div className="student-table-wrapper">
              <table className="student-table attendance-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const studentId = getStudentId(student);

                    return (
                      <tr key={studentId}>
                        <td>{student.rollNumber}</td>
                        <td>{student.name}</td>

                        <td>
                          <div className="attendance-status-actions">
                            <button
                              type="button"
                              className={`attendance-status-btn present-btn ${
                                attendance[studentId] === "Present"
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                markStudent(studentId, "Present")
                              }
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              className={`attendance-status-btn absent-btn ${
                                attendance[studentId] === "Absent"
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                markStudent(studentId, "Absent")
                              }
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {error && (
              <p className="attendance-error">{error}</p>
            )}

            {message && (
              <p className="attendance-success">{message}</p>
            )}

            <div className="attendance-save-area">
              <span>
                {markedCount === students.length
                  ? "All students have been marked."
                  : `${students.length - markedCount} student(s) still need attendance.`}
              </span>

              <button
                type="button"
                className="primary-btn"
                onClick={handleSave}
                disabled={!subjectId || saving}
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </>
        )}
      </section>

      <section className="attendance-history-section">
        <div className="attendance-roster-header">
          <div>
            <h2>Attendance History</h2>
          </div>

          <span className="attendance-count">
            {attendanceHistory.length} Records
          </span>
        </div>

        {loadingHistory ? (
          <div className="attendance-empty-state">
            <p>Loading attendance history...</p>
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="attendance-empty-state">
            <p>No attendance records available yet.</p>
          </div>
        ) : (
          <div className="attendance-history-list">
            {sortedHistory.map((record) => {
              const present = record.records.filter(
                (item) => item.status === "Present"
              ).length;

              const absent = record.records.filter(
                (item) => item.status === "Absent"
              ).length;

              return (
                <div
                  className="attendance-history-item"
                  key={record.id}
                >
                  <div>
                    <strong>
                      {record.subject || "Unknown Subject"}
                    </strong>
                    <span>{record.date}</span>
                  </div>

                  <div className="history-counts">
                    <span>{present} Present</span>
                    <span>{absent} Absent</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openHistoryRecord(record)}
                  >
                    View
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Attendance;
