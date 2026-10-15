
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveToken, saveUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type LoginResponse = {
  token: string;
  role: string;
  userId?: number;
  name?: string;
  email?: string;
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data: LoginResponse = await apiFetch(
        "/api/auth/login",
        {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      if (!data.token) {
        throw new Error(
          "JWT token not returned from server."
        );
      }

      // Only administrators can use this login page
      if (data.role !== "ADMIN") {
        throw new Error(
          "Access denied. This login is for administrators only."
        );
      }

      // Save JWT only after checking the role
      saveToken(data.token);

      saveUser({
        id: data.userId,
        name: data.name,
        email: data.email || email.trim().toLowerCase(),
        role: data.role,
      });

      router.replace("/admin/dashboard");
      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to authenticate."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      {/* Admin Login Heading */}
      <div className="auth-intro">
        <span
          className="auth-icon"
          style={{
            background:
              "linear-gradient(135deg, #0f172a, #334155)",
            boxShadow:
              "0 8px 24px rgba(15, 23, 42, 0.3)",
          }}
        >
          🔐
        </span>

        <div
          className="page-eyebrow"
          style={{ color: "#334155" }}
        >
          FACULTY & REGISTRAR ACCESS
        </div>

        <h1 className="page-title">
          Admin Console Sign In
        </h1>

        <p className="page-description">
          Restricted administrative access for
          academic coordinators and staff.
        </p>
      </div>

      {/* Admin Authentication Form */}
      <section className="surface auth-card">
        <h2>Administrator Authentication</h2>

        <p
          className="muted"
          style={{
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          Enter authorized administrative credentials.
        </p>

        {error && (
          <p
            className="notice notice-error"
            role="alert"
          >
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
              htmlFor="admin-email"
            >
              Administrative Email
            </label>

            <input
              id="admin-email"
              className="form-input"
              type="email"
              autoComplete="username"
              placeholder="admin@university.edu"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="form-label"
              htmlFor="admin-password"
            >
              Security Password
            </label>

            <div className="password-row">
              <input
                id="admin-password"
                className="form-input"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
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

          {/* Sign In Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 8,
              background: "#0f172a",
              boxShadow:
                "0 5px 14px rgba(15, 23, 42, 0.25)",
            }}
          >
            {loading
              ? "Verifying..."
              : "Authorize Sign In →"}
          </button>
        </form>

        {/* Student Login Link */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid #edf2f7",
            textAlign: "center",
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Looking for the Student Portal?{" "}
          <Link
            href="/student/login"
            className="small-link"
          >
            Student Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
