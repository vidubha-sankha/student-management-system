
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GraduationCapIcon from "@/app/components/GraduationCapIcon";
import { saveToken, saveUser } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export default function StudentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Invalid email or password"
            : `Login failed (${response.status})`
        );
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error("JWT token not received from server");
      }

      if (data.role !== "STUDENT") {
        throw new Error(
          "This account is not a student account. Please use Admin Sign In."
        );
      }

      saveToken(data.token);

      saveUser({
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      router.replace("/student/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      {/* Login Heading */}
      <div className="auth-intro">
        <span className="auth-icon">
          <GraduationCapIcon size={30} />
        </span>

        <div className="page-eyebrow">
          CAMPUSFLOW STUDENT ACCESS
        </div>

        <h1 className="page-title">
          Sign in to Student Portal
        </h1>

        <p className="page-description">
          Enter your academic credentials to access
          modules and records.
        </p>
      </div>

      {/* Login Form */}
      <section className="surface auth-card">
        <h2>Student Authentication</h2>

        <p
          className="muted"
          style={{
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          Enter your registered student email and password.
        </p>

        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        <form
          className="form-grid"
          onSubmit={handleLogin}
        >
          {/* Email */}
          <div>
            <label
              className="form-label"
              htmlFor="student-login-email"
            >
              Student Email
            </label>

            <input
              id="student-login-email"
              className="form-input"
              type="email"
              autoComplete="username"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="form-label"
              htmlFor="student-login-password"
            >
              Password
            </label>

            <div className="password-row">
              <input
                id="student-login-password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          {/* Login Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 8,
            }}
          >
            {loading
              ? "Authenticating..."
              : "Sign In to Dashboard →"}
          </button>
        </form>

        {/* Register Link */}
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          Don&apos;t have an account yet?{" "}
          <Link
            href="/student/register"
            className="small-link"
          >
            Register as a student
          </Link>
        </div>

        {/* Admin Login Link */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: "1px solid #edf2f7",
            textAlign: "center",
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Staff or Administrator?{" "}
          <Link
            href="/admin/login"
            className="small-link"
          >
            Admin Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
