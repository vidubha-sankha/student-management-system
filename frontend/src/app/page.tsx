

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveToken } from "@/lib/auth";
import GraduationCapIcon from "./components/GraduationCapIcon";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password.");
        }
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error("JWT token not received from backend.");
      }

      saveToken(data.token);

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to backend. Check Spring Boot and CORS."
          : err instanceof Error
            ? err.message
            : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      <div className="auth-intro">
        <span className="auth-icon">
          <GraduationCapIcon size={30} />
        </span>
        <div className="page-eyebrow">WELCOME BACK</div>
        <h1 className="page-title">Sign in to CampusFlow</h1>
        <p className="page-description">
          Your academic workspace, all in one place.
        </p>
      </div>

      <section className="surface auth-card">
        <h2>Account sign in</h2>

        <p
          className="muted"
          style={{ fontSize: 14, marginBottom: 25 }}
        >
          Enter your credentials to continue.
        </p>

        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        <form className="form-grid" onSubmit={handleLogin}>
          <div>
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              className="form-input"
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">
              Password
            </label>

            <div className="password-row">
              <input
                className="form-input"
                id="password"
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
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: 6 }}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <p className="auth-footer">
          CampusFlow · Secure sign in
        </p>
      </section>

      <p style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/" className="small-link">
          ← Return to dashboard
        </Link>
      </p>
    </main>
  );
}
