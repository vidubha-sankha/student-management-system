
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {

    const pathname = usePathname();

    const links = [
        {
            name: "Dashboard",
            href: "/",
        },
        {
            name: "Students",
            href: "/students",
        },
        {
            name: "Courses",
            href: "/courses",
        },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.container}>


                <Link
                    href="/"
                    className={styles.brand}
                    aria-label="Student Management System home"
                >
                    <span
                        className={styles.brandIcon}
                        aria-hidden="true"
                    >
                        ✦
                    </span>

                    <span className={styles.brandText}>
                        <strong>CampusFlow</strong>
                        <small>Student Management</small>
                    </span>
                </Link>

                <nav
                    className={styles.navLinks}
                    aria-label="Main navigation"
                >
                    {links.map((link) => {
                        const active =
                            link.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`
                  ${styles.navLink}
                  ${active ? styles.active : ""}
                `}
                            >
                                {link.name}
                            </Link>
                        );
                    })}


                    <Link
                        href="/login"
                        className={`
              ${styles.loginButton}
              ${pathname === "/login" ? styles.loginActive : ""}
            `}
                    >
                        Sign in
                        <span aria-hidden="true"> →</span>
                    </Link>
                </nav>

            </div>
        </header>
    );
}
