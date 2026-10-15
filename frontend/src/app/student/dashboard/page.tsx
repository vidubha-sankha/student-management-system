
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { API_URL } from "@/lib/api";

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  course?: {
    id: number;
    name: string;
    description: string;
  };
  profilePhotoUrl?: string;
}

interface ChangeRequest {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function StudentDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeRequests, setActiveRequests] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const loadDashboardCounts = useCallback(async () => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || !currentUser) return;

    try {
      const response = await fetch(
        `${API_URL}/api/student/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load student requests");
      }

      const requests: ChangeRequest[] = await response.json();

      // Count pending requests
      const pendingCount = requests.filter(
        (request) => request.status === "PENDING"
      ).length;

      setActiveRequests(pendingCount);

      // Same localStorage key as Notifications Page
      const storageKey =
        `campusflow_read_notifications_${currentUser.email}`;

      let readIds: string[] = [];

      try {
        const stored = localStorage.getItem(storageKey);

        if (stored) {
          const parsed: unknown = JSON.parse(stored);

          if (
            Array.isArray(parsed) &&
            parsed.every(
              (item) => typeof item === "string"
            )
          ) {
            readIds = parsed;
          }
        }
      } catch {
        readIds = [];
      }

      // Same notification IDs as Notifications Page
      const unreadCount = requests.filter((request) => {
        const notificationId =
          `request-${request.id}-${request.status}`;

        return !readIds.includes(notificationId);
      }).length;

      setUnreadAlerts(unreadCount);
    } catch (error) {
      console.warn(
        "Could not load dashboard request counts:",
        error
      );
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || currentUser?.role !== "STUDENT") {
      router.replace("/student/login");
      return;
    }

    setUser(currentUser);

    async function loadProfile() {
      try {
        const response = await fetch(
          `${API_URL}/api/student/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          router.replace("/student/login");
          return;
        }

        if (response.ok) {
          const data: StudentProfile = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.warn(
          "Could not load backend student profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
    void loadDashboardCounts();

    // Refresh counts when returning to dashboard tab
    function refreshOnFocus() {
      void loadDashboardCounts();
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void loadDashboardCounts();
      }
    }

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener(
      "visibilitychange",
      refreshWhenVisible
    );

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener(
        "visibilitychange",
        refreshWhenVisible
      );
    };
  }, [router, loadDashboardCounts]);

  return (
    <main className="app-page">
      {/* Header Greeting */}
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">
            STUDENT WORKSPACE
          </div>

          <h1 className="page-title">
            Welcome back, {profile?.name || user?.name || "Student"} 👋
          </h1>

          <p className="page-description">
            Here is an overview of your academic program,
            pending inquiries, and course status.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/student/requests"
            className="btn-primary"
          >
            + New Request
          </Link>

          <Link
            href="/student/profile"
            className="btn-secondary"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        {/* Academic Status */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {profile?.course?.name ? "Active" : "Enrolled"}
            </span>

            <span className="stat-label">
              Academic Status
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            🎓
          </div>
        </div>

        {/* Registered Program */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {profile?.course
                ? `ID #${profile.course.id}`
                : "1 Course"}
            </span>

            <span className="stat-label">
              Registered Program
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#e0e7ff",
              color: "#4338ca",
            }}
          >
            📚
          </div>
        </div>

        {/* Active Requests - REAL DATA */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {activeRequests}
            </span>

            <span className="stat-label">
              Active Requests
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#fef3c7",
              color: "#b45309",
            }}
          >
            📝
          </div>
        </div>

        {/* Unread Alerts - REAL DATA */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {unreadAlerts}
            </span>

            <span className="stat-label">
              Unread Alerts
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            🔔
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 24,
        }}
      >
        {/* Enrolled Course Spotlight */}
        <section className="surface">
          <div className="section-heading">
            <h2>Current Program & Course</h2>

            <span className="badge badge-success">
              Enrolled
            </span>
          </div>

          {loading ? (
            <p className="muted">
              Fetching enrolled course details...
            </p>
          ) : profile?.course ? (
            <div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f8faff, #eef2ff)",
                  border: "1px solid #e0e7ff",
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#6366f1",
                    marginBottom: 4,
                  }}
                >
                  PROGRAM DETAILS (ID: {profile.course.id})
                </div>

                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#1e1b4b",
                  }}
                >
                  {profile.course.name}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#475569",
                    lineHeight: 1.5,
                  }}
                >
                  {profile.course.description ||
                    "Comprehensive syllabus and core learning modules."}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "#f8faff",
                    padding: 12,
                    borderRadius: 10,
                    fontSize: 13,
                  }}
                >
                  <span
                    className="muted"
                    style={{ display: "block" }}
                  >
                    Attendance Rate
                  </span>

                  <strong
                    style={{
                      fontSize: 16,
                      color: "#1e293b",
                    }}
                  >
                    94.5%
                  </strong>
                </div>

                <div
                  style={{
                    background: "#f8faff",
                    padding: 12,
                    borderRadius: 10,
                    fontSize: 13,
                  }}
                >
                  <span
                    className="muted"
                    style={{ display: "block" }}
                  >
                    Term Progress
                  </span>

                  <strong
                    style={{
                      fontSize: 16,
                      color: "#4f46e5",
                    }}
                  >
                    Semester 1
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty">
              <p>No specific course assigned yet.</p>

              <Link
                href="/student/requests"
                className="btn-secondary"
                style={{ marginTop: 8 }}
              >
                Request Course Allocation
              </Link>
            </div>
          )}
        </section>

        {/* Quick Actions & Navigation */}
        <section className="surface">
          <div className="section-heading">
            <h2>Student Service Portal</h2>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {/* Profile Link */}
            <Link
              href="/student/profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                background: "#fafbff",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  👤
                </span>

                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 15,
                    }}
                  >
                    My Profile & Credentials
                  </strong>

                  <span
                    className="muted"
                    style={{ fontSize: 13 }}
                  >
                    Review email, enrollment date,
                    and photo avatar
                  </span>
                </div>
              </div>

              <span
                style={{
                  color: "#6366f1",
                  fontWeight: 700,
                }}
              >
                →
              </span>
            </Link>

            {/* Requests Link */}
            <Link
              href="/student/requests"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                background: "#fafbff",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  📑
                </span>

                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 15,
                    }}
                  >
                    Academic Inquiries & Requests
                  </strong>

                  <span
                    className="muted"
                    style={{ fontSize: 13 }}
                  >
                    Transcripts, course transfer,
                    leave requests
                  </span>
                </div>
              </div>

              <span
                style={{
                  color: "#6366f1",
                  fontWeight: 700,
                }}
              >
                →
              </span>
            </Link>

            {/* Notifications Link */}
            <Link
              href="/student/notifications"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                background: "#fafbff",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  🔔
                </span>

                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 15,
                    }}
                  >
                    Campus Notifications
                  </strong>

                  <span
                    className="muted"
                    style={{ fontSize: 13 }}
                  >
                    Exam dates, timetable announcements,
                    grade alerts
                  </span>
                </div>
              </div>

              <span
                style={{
                  color: "#6366f1",
                  fontWeight: 700,
                }}
              >
                →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
