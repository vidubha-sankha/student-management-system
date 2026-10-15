
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser, AuthUser } from "@/lib/auth";
import { API_URL } from "@/lib/api";

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  course?: {
    id: number;
    name: string;
    description?: string;
  } | null;
}

export default function StudentProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    const currentUser = getUser();

    if (!token || currentUser?.role !== "STUDENT") {
      router.replace("/student/login");
      return;
    }

    setUser(currentUser);

    let cancelled = false;

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/api/student/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(
            `Could not load student profile (${res.status}).`
          );
        }

        const data: StudentProfile = await res.json();

        if (!cancelled) {
          setProfile(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not fetch student profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const displayName =
    profile?.name || user?.name || "Student";

  const displayEmail =
    profile?.email || user?.email || "Not available";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">
            ACADEMIC IDENTITY
          </div>

          <h1 className="page-title">
            My Student Profile
          </h1>

          <p className="page-description">
            View your personal information and registered
            academic program.
          </p>
        </div>

        <Link
          href="/student/dashboard"
          className="btn-secondary"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="notice notice-error" role="alert">
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 24,
        }}
      >
        {/* Student Identity Card */}
        <section
          className="surface"
          style={{
            textAlign: "center",
            padding: "36px 24px",
          }}
        >
          {/* Default Avatar */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#ffffff",
              fontSize: 38,
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
              boxShadow:
                "0 10px 25px rgba(79, 70, 229, 0.35)",
            }}
          >
            {initial}
          </div>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: "0 0 4px",
            }}
          >
            {displayName}
          </h2>

          <p
            className="muted"
            style={{
              margin: "0 0 16px",
              fontSize: 14,
            }}
          >
            {displayEmail}
          </p>

          <div
            style={{
              display: "inline-flex",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <span className="badge badge-success">
              Student Account
            </span>

            <span className="badge badge-info">
              Role: STUDENT
            </span>
          </div>

          <div
            style={{
              textAlign: "left",
              borderTop: "1px solid #edf2f7",
              paddingTop: 20,
              display: "grid",
              gap: 12,
              fontSize: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span className="muted">
                Student Record ID:
              </span>

              <strong>
                {loading
                  ? "Loading..."
                  : profile
                    ? `#${profile.id}`
                    : "Unavailable"}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span className="muted">
                Registered Course:
              </span>

              <strong>
                {loading
                  ? "Loading..."
                  : profile?.course?.name ?? "Not assigned"}
              </strong>
            </div>
          </div>
        </section>

        {/* Academic Program Card */}
        <section className="surface">
          <div className="section-heading">
            <h2>Enrolled Academic Degree</h2>

            <span className="badge badge-info">
              Program Details
            </span>
          </div>

          {loading ? (
            <p className="muted">
              Loading academic data...
            </p>
          ) : profile?.course ? (
            <div
              style={{
                background: "#f8faff",
                border: "1px solid #e0e7ff",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#4f46e5",
                  marginBottom: 4,
                }}
              >
                COURSE CODE / ID: {profile.course.id}
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 19,
                  fontWeight: 800,
                }}
              >
                {profile.course.name}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                {profile.course.description ||
                  "No course description available."}
              </p>
            </div>
          ) : (
            <div className="empty">
              <p>
                No academic program linked to this
                student account.
              </p>

              <Link
                href="/student/requests"
                className="btn-secondary"
                style={{ marginTop: 8 }}
              >
                Submit Course Change Request
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
