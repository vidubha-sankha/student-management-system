"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";

interface CourseRef {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  course?: CourseRef;
}

export default function AdminStudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCourseId, setFormCourseId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    loadData(token);
  }, [router]);

  async function loadData(token: string) {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(`${API_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sRes.ok) {
        const sData = await sRes.json();
        if (Array.isArray(sData)) setStudents(sData);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        if (Array.isArray(cData)) setCourses(cData);
      }
    } catch (err) {
      console.warn("Error loading student records:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingStudent(null);
    setFormName("");
    setFormEmail("");
    setFormCourseId(courses.length > 0 ? courses[0].id : "");
    setShowModal(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormCourseId(student.course?.id || "");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setNotice(null);

    const payload = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      courseId: formCourseId ? Number(formCourseId) : null,
    };

    try {
      const url = editingStudent
        ? `${API_URL}/api/students/${editingStudent.id}`
        : `${API_URL}/api/students`;

      const method = editingStudent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Operation failed (${res.status})`);
      }

      setShowModal(false);
      setNotice({
        text: editingStudent
          ? "Student record updated successfully."
          : "New student added successfully.",
        type: "success",
      });
      loadData(token);
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : "An error occurred.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete student "${name}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Delete failed (${res.status})`);
      }

      setNotice({ text: "Student deleted successfully.", type: "success" });
      setStudents(students.filter((s) => s.id !== id));
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : "Unable to delete student.",
        type: "error",
      });
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.course?.name && s.course.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">ADMINISTRATIVE DIRECTORY</div>
          <h1 className="page-title">Manage Students</h1>
          <p className="page-description">
            View, enroll, modify, and delete student records across academic programs.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-primary" onClick={openCreateModal}>
            + Add Student
          </button>
          <Link href="/admin/dashboard" className="btn-secondary">
            ← Dashboard
          </Link>
        </div>
      </div>

      {notice && (
        <div className={`notice notice-${notice.type}`}>
          {notice.text}
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="surface" style={{ padding: 16, marginBottom: 20 }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search students by name, email, or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Students Data Table */}
      <section className="surface" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Institutional Email</th>
                <th>Enrolled Degree</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: "#4f46e5" }}>#{s.id}</strong>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td className="muted">{s.email}</td>
                    <td>
                      {s.course ? (
                        <span className="pill">{s.course.name}</span>
                      ) : (
                        <span className="muted" style={{ fontSize: 13 }}>
                          None
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button
                          type="button"
                          className="btn-soft"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => openEditModal(s)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => handleDelete(s.id, s.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty">
                    {loading ? "Loading student database..." : "No matching students found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-heading" style={{ marginBottom: 16 }}>
              <h2>{editingStudent ? "Edit Student Details" : "Add New Student"}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: 0, fontSize: 18, color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label className="form-label" htmlFor="f-name">
                  Student Name
                </label>
                <input
                  id="f-name"
                  className="form-input"
                  placeholder="Full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="f-email">
                  Student Email
                </label>
                <input
                  id="f-email"
                  className="form-input"
                  type="email"
                  placeholder="student@university.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="f-course">
                  Assign Course
                </label>
                <select
                  id="f-course"
                  className="form-input"
                  value={formCourseId}
                  onChange={(e) =>
                    setFormCourseId(e.target.value ? Number(e.target.value) : "")
                  }
                >
                  <option value="">-- No Course Assigned --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (ID: {c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingStudent ? "Save Changes" : "Create Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
