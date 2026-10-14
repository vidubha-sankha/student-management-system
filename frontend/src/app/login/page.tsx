"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [notice, setNotice] = useState(false);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNotice(true);
    };


    return (
        <main className="auth-wrap">

            <div className="auth-intro">
                <span className="auth-icon">✦</span>

                <div className="page-eyebrow">
                    WELCOME BACK
                </div>

                <h1 className="page-title">
                    Sign in to CampusFlow
                </h1>

                <p className="page-description">
                    Your academic workspace, all in one place.
                </p>
            </div>

            <section className="surface auth-card">

                <h2>Account sign in</h2>

                <p
                    className="muted"
                    style={{
                        fontSize: 14,
                        marginBottom: 25,
                    }}
                >
                    Enter your credentials to continue.
                </p>

                {notice && (
                    <p
                        className="notice notice-error"
                        role="status"
                    >
                        Login authentication is not connected yet.
                        This form is a UI preview.
                    </p>
                )}

                <form
                    className="form-grid"
                    onSubmit={handleSubmit}
                >

                    <div>
                        <label
                            className="form-label"
                            htmlFor="email"
                        >
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
                        <label
                            className="form-label"
                            htmlFor="password"
                        >
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
                                onClick={() =>
                                    setShowPassword((v) => !v)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: "100%",
                            marginTop: 6,
                        }}
                    >
                        Sign in →
                    </button>

                </form>

                <p className="auth-footer">
                    Demo interface · Authentication integration pending
                </p>

            </section>

            <p
                style={{
                    textAlign: "center",
                    marginTop: 24,
                }}
            >
                <Link
                    href="/"
                    className="small-link"
                >
                    ← Return to dashboard
                </Link>
            </p>

        </main>
    );
}
