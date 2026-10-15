"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import GraduationCapIcon from "./GraduationCapIcon";
import { getToken, getUser, logout, AuthUser } from "@/lib/auth";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        setHasToken(!!getToken());
        setUser(getUser());
    }, [pathname]);

    const isStudentRoute = pathname.startsWith("/student");
    const isAdminRoute = pathname.startsWith("/admin");

    function handleSignOut() {
        logout();
        setHasToken(false);
        setUser(null);
        if (isAdminRoute) {
            router.push("/admin/login");
        } else if (isStudentRoute) {
            router.push("/student/login");
        } else {
            router.push("/");
        }
        router.refresh();
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link
                    href="/"
                    className={styles.brand}
                    aria-label="CampusFlow home"
                >
                    <span className={styles.brandIcon} aria-hidden="true">
                        <GraduationCapIcon size={22} />
                    </span>
                    <span className={styles.brandText}>
                        <strong>CampusFlow</strong>
                        <small>
                            {isAdminRoute
                                ? "Admin Console"
                                : isStudentRoute
                                ? "Student Portal"
                                : "Student Management"}
                        </small>
                    </span>
                </Link>

                <nav className={styles.navLinks} aria-label="Main navigation">
                    {/* Student Portal Nav */}
                    {isStudentRoute && (
                        <>
                            <Link
                                href="/student/dashboard"
                                className={`${styles.navLink} ${
                                    pathname === "/student/dashboard" ? styles.active : ""
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/student/profile"
                                className={`${styles.navLink} ${
                                    pathname === "/student/profile" ? styles.active : ""
                                }`}
                            >
                                My Profile
                            </Link>
                            <Link
                                href="/student/requests"
                                className={`${styles.navLink} ${
                                    pathname === "/student/requests" ? styles.active : ""
                                }`}
                            >
                                Requests
                            </Link>
                            <Link
                                href="/student/notifications"
                                className={`${styles.navLink} ${
                                    pathname === "/student/notifications" ? styles.active : ""
                                }`}
                            >
                                Notifications
                            </Link>
                        </>
                    )}

                    {/* Admin Portal Nav */}
                    {isAdminRoute && (
                        <>
                            <Link
                                href="/admin/dashboard"
                                className={`${styles.navLink} ${
                                    pathname === "/admin/dashboard" ? styles.active : ""
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/students"
                                className={`${styles.navLink} ${
                                    pathname === "/admin/students" ? styles.active : ""
                                }`}
                            >
                                Students
                            </Link>
                            <Link
                                href="/admin/courses"
                                className={`${styles.navLink} ${
                                    pathname === "/admin/courses" ? styles.active : ""
                                }`}
                            >
                                Courses
                            </Link>
                            <Link
                                href="/admin/requests"
                                className={`${styles.navLink} ${
                                    pathname === "/admin/requests" ? styles.active : ""
                                }`}
                            >
                                Requests
                            </Link>
                        </>
                    )}

                    {/* General Public Nav */}
                    {!isStudentRoute && !isAdminRoute && (
                        <>
                            <Link
                                href="/"
                                className={`${styles.navLink} ${
                                    pathname === "/" ? styles.active : ""
                                }`}
                            >
                                Home
                            </Link>
                            <Link
                                href="/student/login"
                                className={`${styles.navLink} ${
                                    pathname.startsWith("/student") ? styles.active : ""
                                }`}
                            >
                                Student Portal
                            </Link>
                            <Link
                                href="/admin/login"
                                className={`${styles.navLink} ${
                                    pathname.startsWith("/admin") ? styles.active : ""
                                }`}
                            >
                                Admin Portal
                            </Link>
                        </>
                    )}

                    {/* Auth Status & Actions */}
                    {hasToken ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {user?.name && (
                                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                                    {user.name}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className={styles.loginButton}
                                style={{ background: "#fef2f2", color: "#dc2626" }}
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href={
                                isAdminRoute
                                    ? "/admin/login"
                                    : isStudentRoute
                                    ? "/student/login"
                                    : "/student/login"
                            }
                            className={styles.loginButton}
                        >
                            Sign in <span aria-hidden="true">→</span>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
