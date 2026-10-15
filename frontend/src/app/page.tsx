
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Course = {
  id: number;
  name: string;
  description?: string;
};

export default function StudentRegisterPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    courseId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await apiFetch("/api/courses", {
          skipAuth: true,
        });

        setCourses(data);
      } catch {
        setError("Could not load courses.");
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.courseId) {
      setError("Please select a course.");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          courseId: Number(form.courseId),
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      router.push("/student/login?registered=1");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    fontSize: 14,
    marginTop: 6,
  };

  return (
    <main
      style={{
        maxWidth: 500,
        margin: "50px auto",
        padding: "0 20px",
      }}
    >
      <div className="surface" style={{ padding: 30 }}>
        <div className="page-eyebrow">
          STUDENT PORTAL
        </div>

        <h1 className="page-title">
          Create Student Account
        </h1>

        <p className="page-description">
          Register to access your student dashboard.
        </p>

        {error && (
          <div
            role="alert"
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: 12,
              borderRadius: 8,
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 16 }}
        >
          <label>
            Full Name
            <input
              style={inputStyle}
              type="text"
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Enter your full name"
            />
          </label>

          <label>
            Email Address
            <input
              style={inputStyle}
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="student@example.com"
            />
          </label>

          <label>
            Select Course
            <select
              style={inputStyle}
              required
              disabled={loadingCourses}
              value={form.courseId}
              onChange={(e) =>
                setForm({ ...form, courseId: e.target.value })
              }
            >
              <option value="">
                {loadingCourses
                  ? "Loading courses..."
                  : "Select a course"}
              </option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Password
            <input
              style={inputStyle}
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Enter password"
            />
          </label>

          <label>
            Confirm Password
            <input
              style={inputStyle}
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Confirm password"
            />
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || loadingCourses}
            style={{
              justifyContent: "center",
              padding: 14,
            }}
          >
            {submitting
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 22,
            fontSize: 14,
          }}
        >
          Already registered?{" "}
          <Link href="/student/login">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
