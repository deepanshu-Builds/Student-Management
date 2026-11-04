
import { useEffect, useState } from "react";
import StudentForm from "./StudentForm";
import StudentProgress from "./StudentProgress";
import Attendance from "./Attendance";
import { apiRequest } from "../services/api";
import "../styles/Section.css";

function SectionDetails({
  section,
  onBack,
  onUpdateSection,
  accessToken
}) {
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [students, setStudents] = useState(section.students || []);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentError, setStudentError] = useState("");

  const subjects = section.subjects || [];
  const attendanceHistory = section.attendance || [];

  // Fetch students belonging to this section
  useEffect(() => {
    let cancelled = false;

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        setStudentError("");

        const data = await apiRequest(
          `/students?section=${encodeURIComponent(section.id)}&limit=100`,
          {},
          accessToken
        );

        if (cancelled) return;

        const normalizedStudents = (data.students || []).map((student) => ({
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department,
          year: student.year,
          section: student.section?._id || student.section
        }));

        setStudents(normalizedStudents);

        onUpdateSection(section.id, {
          students: normalizedStudents
        });
      } catch (error) {
        if (!cancelled) {
          setStudentError(error.message || "Unable to load students.");
        }
      } finally {
        if (!cancelled) {
          setLoadingStudents(false);
        }
      }
    };

    if (accessToken && section.id) {
      fetchStudents();
    } else {
      setLoadingStudents(false);
    }

    return () => {
      cancelled = true;
    };
  }, [section.id, accessToken]);

  const sortedStudents = [...students].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base"
    })
  );

  const openAddForm = () => {
    setEditingStudent(null);
    setShowStudentForm(true);
  };

  const openEditForm = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const closeForm = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
  };

  // CREATE / UPDATE STUDENT
  const handleSaveStudent = async (studentData) => {
    try {
      setStudentError("");

      if (editingStudent) {
        const data = await apiRequest(
          `/students/roll/${encodeURIComponent(editingStudent.rollNumber)}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: studentData.name
            })
          },
          accessToken
        );

        const updatedStudent = {
          id: data.student._id,
          name: data.student.name,
          rollNumber: data.student.rollNumber,
          department: data.student.department,
          year: data.student.year,
          section: data.student.section?._id || data.student.section
        };

        const updatedStudents = students.map((student) =>
          student.id === editingStudent.id ? updatedStudent : student
        );

        setStudents(updatedStudents);

        onUpdateSection(section.id, {
          students: updatedStudents
        });
      } else {
        const data = await apiRequest(
          "/students",
          {
            method: "POST",
            body: JSON.stringify({
              name: studentData.name,
              rollNumber: studentData.rollNumber,
              section: section.id
            })
          },
          accessToken
        );

        const newStudent = {
          id: data.student._id,
          name: data.student.name,
          rollNumber: data.student.rollNumber,
          department: data.student.department,
          year: data.student.year,
          section: data.student.section?._id || data.student.section
        };

        const updatedStudents = [...students, newStudent];

        setStudents(updatedStudents);

        onUpdateSection(section.id, {
          students: updatedStudents
        });
      }

      closeForm();
      return null;
    } catch (error) {
      return error.message || "Unable to save student.";
    }
  };

  // DELETE STUDENT
  const handleDeleteStudent = async (studentId) => {
    const student = students.find((item) => item.id === studentId);

    if (!student) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      setStudentError("");

      await apiRequest(
        `/students/roll/${encodeURIComponent(student.rollNumber)}`,
        {
          method: "DELETE"
        },
        accessToken
      );

      const updatedStudents = students.filter(
        (item) => item.id !== studentId
      );

      setStudents(updatedStudents);

      const updatedAttendance = attendanceHistory.map((record) => ({
        ...record,
        records: (record.records || []).filter(
          (item) => item.studentId !== studentId
        )
      }));

      onUpdateSection(section.id, {
        students: updatedStudents,
        attendance: updatedAttendance
      });

      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
    } catch (error) {
      setStudentError(error.message || "Unable to delete student.");
    }
  };

  // Existing local attendance handling
  const handleSaveAttendance = (attendanceData) => {
    const existingRecord = attendanceHistory.find(
      (record) =>
        record.subjectId === attendanceData.subjectId &&
        record.date === attendanceData.date
    );

    let updatedAttendance;

    if (existingRecord) {
      updatedAttendance = attendanceHistory.map((record) =>
        record.id === existingRecord.id
          ? { ...record, records: attendanceData.records }
          : record
      );
    } else {
      updatedAttendance = [
        ...attendanceHistory,
        {
          id: crypto.randomUUID(),
          ...attendanceData
        }
      ];
    }

    onUpdateSection(section.id, {
      attendance: updatedAttendance
    });
  };

  if (showAttendance) {
    return (
      <Attendance
        section={{
          ...section,
          students
        }}
        onBack={() => setShowAttendance(false)}
        onSaveAttendance={handleSaveAttendance}
        accessToken={accessToken}
      />
    );
  }

  return (
    <div className="section-details-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Sections
      </button>

      <div className="details-header">
        <div>
          <h1>{section.name}</h1>

          <span className="section-year">
            ACADEMIC YEAR {section.year}
          </span>
        </div>

        <div className="details-header-actions">
          <div className="manage-attendance"></div>
          <button
            className="attendance-open-btn"
            onClick={() => setShowAttendance(true)}
          >
            Manage Attendance
          </button>

          <button
            className="primary-btn"
            onClick={openAddForm}
          >
            + Add Student
          </button>
        </div>
      </div>

      <div className="details-summary">
        <div className="details-summary-card">
          <span>Total Students</span>
          <strong>{students.length}</strong>
        </div>

        <div className="details-summary-card">
          <span>Total Subjects</span>
          <strong>{subjects.length}</strong>
        </div>
      </div>

      <section className="details-section">
        <div className="details-section-heading">
          <div>
            <h2>Subjects</h2>
          </div>
        </div>

        <div className="details-subject-list">
          {subjects.map((subject) => (
            <div
              className="details-subject-item"
              key={subject.id}
            >
              <span className="subject-dot"></span>
              {subject.name}
            </div>
          ))}
        </div>
      </section>

      <section className="details-section">
        <div className="details-section-heading">
          <div>
            <h2>Students</h2>
          </div>
        </div>

        {studentError && (
          <p className="form-error" role="alert">
            {studentError}
          </p>
        )}

        {loadingStudents ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <div className="student-empty-state">
            <h3>No students added yet</h3>

            <button
              className="primary-btn"
              onClick={openAddForm}
            >
              Add First Student
            </button>
          </div>
        ) : (
          <div className="student-table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.name}</td>

                    <td>
                      <div className="student-actions">
                        <button
                          className="edit-student-btn"
                          onClick={() => openEditForm(student)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-student-btn"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          className="view-progress-btn"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Progress
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showStudentForm && (
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onClose={closeForm}
        />
      )}

      {selectedStudent && (
        <StudentProgress
          section={{
            ...section,
            students
          }}
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
            accessToken={accessToken}
        />
      )}
    </div>
  );
}

export default SectionDetails;
