
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
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

interface ChangeRequest {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

type ApiStatus = "checking" | "connected" | "offline";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] =
    useState<ApiStatus>("checking");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setLoading(true);
    setError("");
    setApiStatus("checking");

    try {
      const [studentsRes, coursesRes, requestsRes] =
        await Promise.all([
          fetch(`${API_URL}/api/students`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }),

          fetch(`${API_URL}/api/courses`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }),

          fetch(`${API_URL}/api/admin/requests`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }),
        ]);

      if (
        studentsRes.status === 401 ||
        coursesRes.status === 401 ||
        requestsRes.status === 401
      ) {
        router.replace("/admin/login");
        return;
      }

      if (
        !studentsRes.ok ||
        !coursesRes.ok ||
        !requestsRes.ok
      ) {
        throw new Error(
          "Unable to load all dashboard data."
        );
      }

      const studentData: StudentItem[] =
        await studentsRes.json();

      const courseData: CourseItem[] =
        await coursesRes.json();

      const requestData: ChangeRequest[] =
        await requestsRes.json();

      if (
        !Array.isArray(studentData) ||
        !Array.isArray(courseData) ||
        !Array.isArray(requestData)
      ) {
        throw new Error("Invalid API response.");
      }

      setStudents(studentData);
      setCourses(courseData);

      const pending = requestData.filter(
        (request) => request.status === "PENDING"
      ).length;

      setPendingCount(pending);
      setApiStatus("connected");
    } catch (err) {
      console.warn(
        "Failed loading admin dashboard:",
        err
      );

      setApiStatus("offline");

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || currentUser?.role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }

    setUser(currentUser);

    void loadData();
  }, [router, loadData]);

  return (
    <main className="app-page">
      {/* Top Banner */}
      <div className="page-heading">
        <div>
          <div
            className="page-eyebrow"
            style={{ color: "#0f172a" }}
          >
            ADMINISTRATIVE CONTROL PANEL
          </div>

          <h1 className="page-title">
            Institution Overview
          </h1>

          <p className="page-description">
            Live overview of student enrollments,
            course catalogs, and academic request queues.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/admin/students"
            className="btn-primary"
          >
            + Manage Students
          </Link>

          <Link
            href="/admin/courses"
            className="btn-secondary"
          >
            + Manage Courses
          </Link>

          <Link
            href="/admin/requests"
            className="btn-soft"
          >
            View Requests
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
          }}
        >
          {error}

          <button
            type="button"
            className="btn-soft"
            onClick={() => void loadData()}
            style={{ marginLeft: 12 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="stats-grid">
        {/* Students */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {loading ? "..." : students.length}
            </span>

            <span className="stat-label">
              Enrolled Students
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#e0e7ff",
              color: "#4338ca",
            }}
          >
            👥
          </div>
        </div>

        {/* Courses */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {loading ? "..." : courses.length}
            </span>

            <span className="stat-label">
              Active Degree Courses
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            📚
          </div>
        </div>

        {/* Pending Requests */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {loading ? "..." : pendingCount}
            </span>

            <span className="stat-label">
              Pending Inquiries
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#fef3c7",
              color: "#b45309",
            }}
          >
            ⏳
          </div>
        </div>

        {/* Backend Status */}
        <div className="stat-card">
          <div className="stat-info">
            <span
              className="stat-value"
              style={{
                fontSize: 23,
                color:
                  apiStatus === "connected"
                    ? "#166534"
                    : apiStatus === "offline"
                      ? "#b91c1c"
                      : "#0f172a",
              }}
            >
              {apiStatus === "connected"
                ? "Online"
                : apiStatus === "offline"
                  ? "Offline"
                  : "Checking"}
            </span>

            <span className="stat-label">
              API Connection Status
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#f1f5f9",
              color: "#0f172a",
            }}
          >
            ⚡
          </div>
        </div>
      </div>

      {/* Main Dashboard Sections */}
      <div className="admin-dashboard-grid">
        {/* Recent Student Enrollments */}
        <section
          className="surface"
          style={{
            padding: 0,
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e8ecf3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                margin: 0,
                fontWeight: 800,
              }}
            >
              Recent Enrollments
            </h2>

            <Link
              href="/admin/students"
              className="small-link"
            >
              View All ({students.length}) →
            </Link>
          </div>

          <div className="table-scroll">
            <table
              className="data-table"
              style={{
                width: "100%",
                tableLayout: "auto",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>
                    Student
                  </th>

                  <th style={{ width: "43%" }}>
                    Email
                  </th>

                  <th style={{ width: "32%" }}>
                    Assigned Course
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="empty"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.slice(0, 6).map((student) => (
                    <tr key={student.id}>
                      <td>
                        <strong
                          style={{
                            fontSize: 13,
                            color: "#0f172a",
                          }}
                        >
                          {student.name}
                        </strong>
                      </td>

                      <td
                        className="muted"
                        style={{
                          fontSize: 13,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {student.email}
                      </td>

                      <td>
                        {student.course ? (
                          <span
                            className="pill"
                            style={{
                              fontSize: 11,
                              display: "inline-block",
                              maxWidth: "100%",
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {student.course.name}
                          </span>
                        ) : (
                          <span
                            className="muted"
                            style={{ fontSize: 12 }}
                          >
                            Unassigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="empty"
                    >
                      No students enrolled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Compact Course Catalog */}
        <section
          className="surface"
          style={{
            minWidth: 0,
            padding: 20,
          }}
        >
          <div
            className="section-heading"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ fontSize: 18 }}>
              Course Catalog
            </h2>

            <Link
              href="/admin/courses"
              className="small-link"
            >
              Manage →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {loading ? (
              <div className="empty">
                Loading courses...
              </div>
            ) : courses.length > 0 ? (
              courses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #edf2f7",
                    background: "#fafbff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "#0f172a",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {course.name}
                    </strong>

                    <span
                      className="muted"
                      style={{
                        fontSize: 11,
                        display: "block",
                        marginTop: 3,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {course.description ||
                        "Active Academic Program"}
                    </span>
                  </div>

                  <span
                    className="badge badge-info"
                    style={{
                      flexShrink: 0,
                      fontSize: 11,
                    }}
                  >
                    #{course.id}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty">
                No courses in catalogue.
              </div>
            )}
          </div>

          {/* Pending Requests Link */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #edf2f7",
            }}
          >
            <Link
              href="/admin/requests"
              className="btn-soft"
              style={{
                width: "100%",
                justifyContent: "center",
                textAlign: "center",
                fontSize: 12,
              }}
            >
              Review Requests ({pendingCount} Pending) →
            </Link>
          </div>
        </section>
      </div>

      {/* Responsive Grid Styles */}
      <style jsx>{`
        .admin-dashboard-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 2fr) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1100px) {
          .admin-dashboard-grid {
            grid-template-columns:
              minmax(0, 1.5fr) minmax(0, 1fr);
            gap: 18px;
          }
        }

        @media (max-width: 800px) {
          .admin-dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
