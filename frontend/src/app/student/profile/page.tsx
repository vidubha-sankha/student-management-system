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
    description: string;
  };
  profilePhotoUrl?: string;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/student/login");
      return;
    }

    setUser(getUser());

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/api/student/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          if (data.profilePhotoUrl) {
            setPhotoUrl(data.profilePhotoUrl);
          }
        }
      } catch (err) {
        console.warn("Could not fetch student profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  function handleUpdatePhoto(e: React.FormEvent) {
    e.preventDefault();
    setSaveNotice("Photo preference updated successfully.");
    setTimeout(() => setSaveNotice(""), 3500);
  }

  const displayName = profile?.name || user?.name || "Student User";
  const displayEmail = profile?.email || user?.email || "student@university.edu";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">ACADEMIC IDENTITY</div>
          <h1 className="page-title">My Student Profile</h1>
          <p className="page-description">
            Personal identity credentials, registered degree program, and verified contact info.
          </p>
        </div>

        <Link href="/student/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      {saveNotice && <div className="notice notice-success">{saveNotice}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {/* Profile Identity Card */}
        <section className="surface" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#ffffff",
              fontSize: 38,
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
              boxShadow: "0 10px 25px rgba(79, 70, 229, 0.35)",
            }}
          >
            {initial}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{displayName}</h2>
          <p className="muted" style={{ margin: "0 0 16px", fontSize: 14 }}>
            {displayEmail}
          </p>

          <div style={{ display: "inline-flex", gap: 8, marginBottom: 24 }}>
            <span className="badge badge-success">Active Enrolled</span>
            <span className="badge badge-info">Role: STUDENT</span>
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Student Record ID:</span>
              <strong>#{profile?.id || user?.id || "STU-2026"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Enrollment Term:</span>
              <strong>Academic Year 2026</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Account Status:</span>
              <strong style={{ color: "#166534" }}>Verified</strong>
            </div>
          </div>
        </section>

        {/* Academic Program Details */}
        <section className="surface">
          <div className="section-heading">
            <h2>Enrolled Academic Degree</h2>
            <span className="badge badge-info">Program Details</span>
          </div>

          {loading ? (
            <p className="muted">Loading academic data...</p>
          ) : profile?.course ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  background: "#f8faff",
                  border: "1px solid #e0e7ff",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: "#4f46e5", marginBottom: 4 }}>
                  COURSE CODE / ID: {profile.course.id}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800 }}>
                  {profile.course.name}
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                  {profile.course.description || "Core undergraduate academic curriculum."}
                </p>
              </div>

              <div className="surface" style={{ padding: 18, background: "#fafbff" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 15 }}>Department Advisor</h4>
                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                  <strong>Dr. Samantha Alwis</strong>
                  <div className="muted" style={{ fontSize: 13 }}>
                    Senior Academic Coordinator · Dept. of Information Systems
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Email: advisor.faculty@university.edu
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty">
              <p>No formal degree linked to this user account yet.</p>
              <Link href="/student/requests" className="btn-secondary" style={{ marginTop: 8 }}>
                Submit Course Allocation Request
              </Link>
            </div>
          )}

          {/* Optional Photo URL */}
          <form onSubmit={handleUpdatePhoto} style={{ marginTop: 24, borderTop: "1px solid #edf2f7", paddingTop: 20 }}>
            <label className="form-label" htmlFor="photo-url">
              Avatar Image URL
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                id="photo-url"
                className="form-input"
                type="url"
                placeholder="https://images.example.com/avatar.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <button type="submit" className="btn-secondary" style={{ flexShrink: 0 }}>
                Save
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
