
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GraduationCapIcon from "@/app/components/GraduationCapIcon";
import { API_URL } from "@/lib/api";

interface CourseOption {
  id: number;
  name: string;
  description?: string;
}

export default function StudentRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch(`${API_URL}/api/courses`);

        if (res.ok) {
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            setCourses(data);
            setCourseId(data[0].id);
          }
        }
      } catch (err) {
        console.warn("Could not fetch courses list:", err);
      } finally {
        setLoadingCourses(false);
      }
    }

    void fetchCourses();
  }, []);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!courseId) {
      setError("Please select an enrolled course program.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          courseId: Number(courseId),
          password,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errData.message ||
            (response.status === 409
              ? "This email is already registered."
              : `Registration failed (${response.status})`)
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/student/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      {/* Registration Heading */}
      <div className="auth-intro">
        <span className="auth-icon">
          <GraduationCapIcon size={30} />
        </span>

        <div className="page-eyebrow">
          STUDENT PORTAL ENROLLMENT
        </div>

        <h1 className="page-title">
          Register Student Account
        </h1>

        <p className="page-description">
          Create your academic account to view enrolled
          modules and profile records.
        </p>
      </div>

      {/* Registration Form */}
      <section className="surface auth-card">
        <h2>New Student Registration</h2>

        <p
          className="muted"
          style={{
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          Provide your institutional information to register.
        </p>

        {/* Error Message */}
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="notice notice-success"
            role="alert"
          >
            <strong>Registration successful!</strong>{" "}
            Redirecting you to sign in...
          </div>
        )}

        {!success && (
          <form
            className="form-grid"
            onSubmit={handleRegister}
          >
            {/* Full Name */}
            <div>
              <label
                className="form-label"
                htmlFor="student-name"
              >
                Full Legal Name
              </label>

              <input
                id="student-name"
                className="form-input"
                type="text"
                placeholder="e.g. Kasun Perera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="form-label"
                htmlFor="student-email"
              >
                Institutional / Personal Email
              </label>

              <input
                id="student-email"
                className="form-input"
                type="email"
                autoComplete="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Course Selection */}
            <div>
              <label
                className="form-label"
                htmlFor="student-course"
              >
                Enrolled Course / Degree Program
              </label>

              {loadingCourses ? (
                <div
                  className="muted"
                  style={{ fontSize: 13 }}
                >
                  Loading courses from catalog...
                </div>
              ) : courses.length > 0 ? (
                <select
                  id="student-course"
                  className="form-input"
                  value={courseId}
                  onChange={(e) =>
                    setCourseId(Number(e.target.value))
                  }
                  required
                >
                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.name} (ID: {course.id})
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    id="student-course"
                    className="form-input"
                    type="number"
                    min={1}
                    placeholder="Enter Course ID (e.g. 1)"
                    value={courseId}
                    onChange={(e) =>
                      setCourseId(
                        e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                      )
                    }
                    required
                  />

                  <small
                    className="muted"
                    style={{
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    Enter Course ID if course list is unavailable.
                  </small>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                className="form-label"
                htmlFor="student-pass"
              >
                Create Password (Min 8 chars)
              </label>

              <div className="password-row">
                <input
                  id="student-pass"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create secure password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="form-label"
                htmlFor="student-confirm-pass"
              >
                Confirm Password
              </label>

              <input
                id="student-confirm-pass"
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 6,
              }}
            >
              {loading
                ? "Registering account..."
                : "Complete Registration →"}
            </button>
          </form>
        )}

        {/* Student Login Link */}
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          Already have an account?{" "}
          <Link
            href="/student/login"
            className="small-link"
          >
            Sign in here
          </Link>
        </div>
      </section>
    </main>
  );
}
