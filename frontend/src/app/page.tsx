
"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Course = {
  id: number;
  name: string;
  description: string;
};

type Student = {
  id: number;
  name: string;
  email: string;
  course: Course | null;
};

const API_URL = "http://localhost:8080/api";

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchData(showLoading = false) {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const [studentsResponse, coursesResponse] =
        await Promise.all([
          fetch(`${API_URL}/students`, { cache: "no-store" }),
          fetch(`${API_URL}/courses`, { cache: "no-store" }),
        ]);

      if (!studentsResponse.ok || !coursesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const studentsData: Student[] =
        await studentsResponse.json();
      const coursesData: Course[] =
        await coursesResponse.json();

      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch(`${API_URL}/students`, { cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch students");
        return r.json();
      }),
      fetch(`${API_URL}/courses`, { cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch courses");
        return r.json();
      }),
    ])
      .then(([studentsData, coursesData]: [Student[], Course[]]) => {
        if (isMounted) {
          setStudents(studentsData);
          setCourses(coursesData);
          setError("");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError("Cannot connect to backend.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setCourseId("");
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  }

  function startAdd() {
    resetForm();
    setSuccess("");
    setShowForm(true);
  }

  function startEdit(student: Student) {
    setEditingId(student.id);
    setName(student.name);
    setEmail(student.email);
    setCourseId(student.course?.id.toString() ?? "");
    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  async function handleSaveStudent(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setFormError("");
    setSuccess("");

    try {
      const selectedCourse = courses.find(
        (course) => course.id === Number(courseId)
      );

      const studentData = {
        name: name.trim(),
        email: email.trim(),
        course: selectedCourse
          ? { id: selectedCourse.id }
          : null,
      };

      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/students/${editingId}`
        : `${API_URL}/students`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to save student (${response.status})`
        );
      }

      resetForm();
      setSuccess(
        isEditing
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      await fetchData();
    } catch (err) {
      console.error(err);
      setFormError(
        "Failed to save student. Check the details and backend."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    setDeletingId(student.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/students/${student.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete student (${response.status})`
        );
      }

      if (editingId === student.id) {
        resetForm();
      }

      setSuccess("Student deleted successfully!");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete student.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Student Management System
          </h1>
          <p className={styles.subtitle}>
            Manage students and courses in one place
          </p>
        </header>

        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>
              Total Students
            </p>
            <h2 className={styles.statValue}>
              {loading ? "..." : students.length}
            </h2>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>
              Total Courses
            </p>
            <h2 className={styles.statValue}>
              {loading ? "..." : courses.length}
            </h2>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>
              System Status
            </p>
            <h2 className={styles.statStatus}>
              {loading
                ? "Connecting..."
                : error
                  ? "Connection Error"
                  : "Backend Connected"}
            </h2>
          </div>
        </section>

        <section id="students" className={styles.mainSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Students
            </h2>

            <button
              type="button"
              className={styles.addButton}
              onClick={() =>
                showForm ? resetForm() : startAdd()
              }
              disabled={saving}
            >
              {showForm ? "Cancel" : "+ Add Student"}
            </button>
          </div>

          {success && (
            <p role="status" style={{ color: "green", marginBottom: 16 }}>
              {success}
            </p>
          )}

          {error && (
            <p role="alert" style={{ color: "red", marginBottom: 16 }}>
              {error}
            </p>
          )}

          {showForm && (
            <form
              onSubmit={handleSaveStudent}
              style={{
                padding: "24px",
                background: "#f8fafc",
                borderRadius: "12px",
                marginBottom: "24px",
                display: "grid",
                gap: "16px",
              }}
            >
              <h3>
                {editingId !== null
                  ? "Edit Student"
                  : "Add New Student"}
              </h3>

              <div>
                <label htmlFor="student-name">
                  Student Name
                </label>
                <input
                  id="student-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter student name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="student-email">
                  Email Address
                </label>
                <input
                  id="student-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="student-course">
                  Select Course
                </label>
                <select
                  id="student-course"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">No Course</option>
                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p role="alert" style={{ color: "red" }}>
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className={styles.addButton}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Student"
                    : "Save Student"}
              </button>
            </form>
          )}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      {error
                        ? "Unable to load students."
                        : "No students yet. Add your first student."}
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        {student.course?.name ?? "Not Assigned"}
                      </td>
                      <td>
                        <div style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}>
                          <button
                            type="button"
                            onClick={() => startEdit(student)}
                            disabled={deletingId !== null || saving}
                            style={{
                              ...actionButtonStyle,
                              background: "#eef2ff", color: "#4338ca",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student)}
                            disabled={deletingId !== null || saving}
                            style={{
                              ...actionButtonStyle,
                              background: "#fef2f2", color: "#b91c1c",
                            }}
                          >
                            {deletingId === student.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "15px",
  background: "white",
  color: "#111827",
};

const actionButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

