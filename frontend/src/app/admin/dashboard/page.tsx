"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser, AuthUser } from "@/lib/auth";
import { API_URL } from "@/lib/api";

interface StudentItem {
  id: number;
  name: string;
  email: string;
  course?: {
    id: number;
    name: string;
  };
}

interface CourseItem {
  id: number;
  name: string;
  description: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setUser(getUser());

    async function loadData() {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          fetch(`${API_URL}/api/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
          fetch(`${API_URL}/api/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        if (studentsRes && studentsRes.ok) {
          const sData = await studentsRes.json();
          if (Array.isArray(sData)) setStudents(sData);
        }

        if (coursesRes && coursesRes.ok) {
          const cData = await coursesRes.json();
          if (Array.isArray(cData)) setCourses(cData);
        }
      } catch (err) {
        console.warn("Failed loading admin summary:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <main className="app-page">
      {/* Top Banner */}
      <div className="page-heading">
        <div>
          <div className="page-eyebrow" style={{ color: "#0f172a" }}>
            ADMINISTRATIVE CONTROL PANEL
          </div>
          <h1 className="page-title">Institution Overview</h1>
          <p className="page-description">
            Live overview of student enrollments, course catalogs, and academic request queues.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/students" className="btn-primary">
            + Manage Students
          </Link>
          <Link href="/admin/courses" className="btn-secondary">
            + Manage Courses
          </Link>
          <Link href="/admin/requests" className="btn-soft">
            View Requests
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">{loading ? "..." : students.length}</span>
            <span className="stat-label">Enrolled Students</span>
          </div>
          <div
            className="stat-icon-wrap"
            style={{ background: "#e0e7ff", color: "#4338ca" }}
          >
            👥
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">{loading ? "..." : courses.length}</span>
            <span className="stat-label">Active Degree Courses</span>
          </div>
          <div
            className="stat-icon-wrap"
            style={{ background: "#dcfce7", color: "#166534" }}
          >
            📚
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">2</span>
            <span className="stat-label">Pending Inquiries</span>
          </div>
          <div
            className="stat-icon-wrap"
            style={{ background: "#fef3c7", color: "#b45309" }}
          >
            ⏳
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">100%</span>
            <span className="stat-label">API Gateway Status</span>
          </div>
          <div
            className="stat-icon-wrap"
            style={{ background: "#f1f5f9", color: "#0f172a" }}
          >
            ⚡
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
        {/* Recent Student Registrations */}
        <section className="surface" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e8ecf3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 800 }}>Recent Enrollments</h2>
            <Link href="/admin/students" className="small-link">
              View All ({students.length}) →
            </Link>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Assigned Course</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td className="muted">{s.email}</td>
                    <td>
                      {s.course ? (
                        <span className="pill">{s.course.name}</span>
                      ) : (
                        <span className="muted" style={{ fontSize: 13 }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="empty">
                      No students enrolled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Admin Actions & Courses Overview */}
        <section className="surface">
          <div className="section-heading">
            <h2>Course Catalog Quick View</h2>
            <Link href="/admin/courses" className="small-link">
              Manage Catalog →
            </Link>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {courses.slice(0, 4).map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #edf2f7",
                  background: "#fafbff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ display: "block", fontSize: 15, color: "#0f172a" }}>
                    {c.name}
                  </strong>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {c.description || "Active Academic Program"}
                  </span>
                </div>
                <span className="badge badge-info">ID #{c.id}</span>
              </div>
            ))}
            {courses.length === 0 && !loading && (
              <div className="empty">No courses in catalogue.</div>
            )}
          </div>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #edf2f7" }}>
            <Link
              href="/admin/requests"
              className="btn-soft"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Review Student Request Queue (2 Pending) →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
