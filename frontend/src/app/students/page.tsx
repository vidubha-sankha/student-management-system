"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Student {
  id: number;
  name: string;
  email: string;
  course: { id: number; name: string } | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  async function load(showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      const r = await fetch("http://localhost:8080/api/students", {
        cache: "no-store",
      });
      if (!r.ok) throw new Error();
      setStudents(await r.json());
      setError("");
    } catch {
      setError("Could not load students. Check the backend connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    fetch("http://localhost:8080/api/students", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: Student[]) => {
        if (isMounted) {
          setStudents(data);
          setError("");
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load students. Check the backend connection.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      students.filter((s) =>
        `${s.name} ${s.email} ${s.course?.name ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [students, query]
  );

  async function remove(s: Student) {
    if (!window.confirm(`Delete ${s.name}?`)) return;
    setDeleting(s.id);
    setNotice("");
    try {
      const r = await fetch(`http://localhost:8080/api/students/${s.id}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error();
      setNotice("Student deleted successfully.");
      await load(false);
    } catch {
      setError("Could not delete student.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">ACADEMIC MANAGEMENT</div>
          <h1 className="page-title">Students</h1>
          <p className="page-description">Browse, search and manage student records.</p>
        </div>
        <Link href="/#students" className="btn-primary">
          + Add Student
        </Link>
      </div>

      <section className="surface">
        <div className="section-heading">
          <h2>
            Student directory <span className="pill">{students.length} total</span>
          </h2>
          <input
            aria-label="Search students"
            className="form-input"
            style={{ maxWidth: 280 }}
            placeholder="Search name, email, course..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {notice && (
          <p className="notice notice-success" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="empty">Loading student records...</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.email}</td>
                    <td>
                      <span className="pill">{s.course?.name ?? "Unassigned"}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={deleting !== null}
                        onClick={() => void remove(s)}
                      >
                        {deleting === s.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty">No matching students found.</div>
            )}
          </div>
        )}

        <p className="muted" style={{ fontSize: 12, marginTop: 16 }}>
          To edit a student, use the Edit action on the Dashboard.
        </p>
      </section>
    </main>
  );
}
