
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GraduationCapIcon from "../components/GraduationCapIcon";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    response.status === 401
                        ? "Invalid email or password"
                        : `Login failed (${response.status})`
                );
            }

            const data = await response.json();

            if (!data.token) {
                throw new Error("JWT token not received");
            }

            sessionStorage.setItem("campusflow_token", data.token);

            router.replace("/");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to login"
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
                            placeholder="you@university.edu"
                            autoComplete="username"
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
                                placeholder="Enter password"
                                autoComplete="current-password"
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
