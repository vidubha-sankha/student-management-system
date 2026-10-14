"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
  id: number;
  name: string;
  description: string;
};

const API_URL = "http://localhost:8080/api/courses";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCourses(showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(API_URL, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load courses");
      }
      setCourses(await response.json());
      setError("");
    } catch {
      setError("Cannot load courses from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    fetch(API_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load courses");
        return res.json();
      })
      .then((data: Course[]) => {
        if (isMounted) {
          setCourses(data);
          setError("");
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Cannot load courses from backend.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
  }

  function editCourse(course: Course) {
    setEditingId(course.id);
    setName(course.name);
    setDescription(course.description ?? "");
    setMessage("");
    setError("");
  }

  async function saveCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingId === null ? API_URL : `${API_URL}/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setMessage(
        editingId === null
          ? "Course added successfully!"
          : "Course updated successfully!"
      );
      resetForm();
      await loadCourses(false);
    } catch {
      setError("Failed to save course.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(course: Course) {
    if (!window.confirm(`Delete ${course.name}?`)) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${course.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("Course deleted successfully!");
      await loadCourses(false);
    } catch {
      setError("Failed to delete course. It may be assigned to students.");
    }
  }

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">ACADEMIC MANAGEMENT</div>
          <h1 className="page-title">Courses</h1>
          <p className="page-description">Create and manage your academic course catalog.</p>
        </div>
        <Link href="/" className="btn-secondary">
          ← Dashboard
        </Link>
      </div>

      <div className="course-layout">
        <section className="surface">
          <div className="section-heading">
            <h2>{editingId === null ? "Add new course" : "Edit course"}</h2>
          </div>
          <form onSubmit={saveCourse} className="form-grid">
            <div>
              <label className="form-label" htmlFor="course-name">
                Course name
              </label>
              <input
                className="form-input"
                id="course-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Software Engineering"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="course-description">
                Description
              </label>
              <textarea
                className="form-input"
                id="course-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn?"
                rows={5}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId === null
                  ? "+ Add course"
                  : "Save changes"}
              </button>
              {editingId !== null && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="surface">
          <div className="section-heading">
            <h2>
              Course catalog <span className="pill">{courses.length} courses</span>
            </h2>
          </div>
          {message && (
            <p className="notice notice-success" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="notice notice-error" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <div className="empty">Loading courses...</div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Course</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>#{course.id}</td>
                      <td>
                        <strong>{course.name}</strong>
                      </td>
                      <td>{course.description || "—"}</td>
                      <td>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => editCourse(course)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => void deleteCourse(course)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && (
                <div className="empty">No courses yet. Add your first course.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
