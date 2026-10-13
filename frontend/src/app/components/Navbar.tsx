"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/" },
    { name: "Students", href: "/students" },
    { name: "Courses", href: "/courses" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left Side: Brand with glowing gradient icon and title */}
        <Link href="/" className={styles.brand} aria-label="Student Management System Home">
          <div className={styles.brandIcon} aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className={styles.brandTitle}>Student Management System</span>
        </Link>

        {/* Right Side: Navigation links and vibrant Login button */}
        <nav className={styles.navLinks} aria-label="Main Navigation">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`${styles.navLink} ${
                  isActive ? styles.navLinkActive : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.name}
              </Link>
            );
          })}

          <Link
            href="/login"
            className={`${styles.loginButton} ${
              pathname === "/login" ? styles.loginButtonActive : ""
            }`}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
