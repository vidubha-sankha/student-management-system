"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";

interface Course {
  id: number;
  name: string;
  description: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    loadCourses(token);
  }, [router]);

  async function loadCourses(token: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data);
      }
    } catch (err) {
      console.warn("Could not load courses:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCourse(null);
    setName("");
    setDescription("");
    setShowModal(true);
  }

  function openEditModal(c: Course) {
    setEditingCourse(c);
    setName(c.name);
    setDescription(c.description || "");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setNotice(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      const url = editingCourse
        ? `${API_URL}/api/courses/${editingCourse.id}`
        : `${API_URL}/api/courses`;

      const method = editingCourse ? "PUT" : "POST";

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
        throw new Error(data.message || `Course operation failed (${res.status})`);
      }

      setShowModal(false);
      setNotice({
        text: editingCourse
          ? "Course curriculum updated successfully."
          : "New course created successfully.",
        type: "success",
      });
      loadCourses(token);
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : "Unable to save course.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number, courseName: string) {
    if (!confirm(`Are you sure you want to delete course "${courseName}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Delete failed (${res.status})`);
      }

      setNotice({ text: "Course deleted successfully.", type: "success" });
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : "Unable to delete course.",
        type: "error",
      });
    }
  }

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">ACADEMIC PROGRAM CURRICULUM</div>
          <h1 className="page-title">Manage Courses</h1>
          <p className="page-description">
            Design academic programs, manage module descriptions, and regulate admissions.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-primary" onClick={openCreateModal}>
            + Create Course
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

      {/* Search Bar */}
      <div className="surface" style={{ padding: 16, marginBottom: 20 }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search courses by name or syllabus description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Courses Grid / List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {filtered.length > 0 ? (
          filtered.map((c) => (
            <div key={c.id} className="surface" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="badge badge-info">ID #{c.id}</span>
                  <span className="badge badge-success">Accredited</span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "#0f172a" }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                  {c.description || "Core undergraduate and postgraduate degree curriculum."}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid #edf2f7",
                }}
              >
                <button
                  type="button"
                  className="btn-soft"
                  style={{ padding: "6px 14px", fontSize: 13 }}
                  onClick={() => openEditModal(c)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  style={{ padding: "6px 14px", fontSize: 13 }}
                  onClick={() => handleDelete(c.id, c.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="surface empty" style={{ gridColumn: "1 / -1" }}>
            {loading ? "Loading courses catalogue..." : "No courses matching search."}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-heading" style={{ marginBottom: 16 }}>
              <h2>{editingCourse ? "Edit Course Syllabus" : "Create Degree Course"}</h2>
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
                <label className="form-label" htmlFor="course-name">
                  Course / Program Title
                </label>
                <input
                  id="course-name"
                  className="form-input"
                  placeholder="e.g. B.Sc. in Software Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="course-desc">
                  Curriculum Description
                </label>
                <textarea
                  id="course-desc"
                  className="form-input"
                  rows={4}
                  placeholder="Detailed course scope, prerequisites, and learning outcomes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
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
                  {submitting ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
