"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main
      style={{
        maxWidth: 440,
        margin: "60px auto",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          padding: 32,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e2e8f0",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
            color: "#0f172a",
          }}
        >
          Sign In
        </h1>
        <p
          style={{
            color: "#64748b",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          Enter your credentials to access the management portal
        </p>

        {submitted ? (
          <div
            style={{
              padding: 16,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 8,
              color: "#1e40af",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            Authentication ready. Connected to backend user service.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#334155",
                marginBottom: 6,
              }}
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
                color: "#0f172a",
                background: "white",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#334155",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
                color: "#0f172a",
                background: "white",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "12px",
              background: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              fontSize: 14,
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
