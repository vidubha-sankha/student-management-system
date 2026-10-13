
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Student {
    id: number;
    name: string;
    email: string;
    course: {
        id: number;
        name: string;
    } | null;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchStudents() {
            try {
                const response = await fetch(
                    "http://localhost:8080/api/students"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch students");
                }

                const data: Student[] = await response.json();
                setStudents(data);
            } catch {
                setError("Unable to load students.");
            } finally {
                setLoading(false);
            }
        }

        fetchStudents();
    }, []);

    return (
        <main
            style={{
                maxWidth: "1100px",
                margin: "50px auto",
                padding: "20px",
            }}
        >
            <Link href="/" style={{ color: "#2563eb" }}>
                ← Back to Dashboard
            </Link>

            <h1 style={{ marginTop: "25px", fontSize: "32px" }}>
                Student Management
            </h1>

            <p>Manage all students in the system.</p>

            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    marginTop: "30px",
                    overflowX: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                    }}
                >
                    <h2 style={{ fontSize: "20px", fontWeight: 600 }}>
                        All Students ({students.length})
                    </h2>
                    <Link
                        href="/"
                        style={{
                            padding: "8px 16px",
                            background: "#2563eb",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "14px",
                            textDecoration: "none",
                        }}
                    >
                        + Add Student
                    </Link>
                </div>

                {loading && <p>Loading students...</p>}

                {error && <p style={{ color: "red" }}>{error}</p>}

                {!loading && !error && (
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            textAlign: "left",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyle}>Student ID</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Course</th>
                            </tr>
                        </thead>

                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td style={tdStyle}>{student.id}</td>
                                    <td style={tdStyle}>{student.name}</td>
                                    <td style={tdStyle}>{student.email}</td>
                                    <td style={tdStyle}>
                                        {student.course?.name ?? "No Course"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && !error && students.length === 0 && (
                    <p style={{ marginTop: "16px", color: "#64748b" }}>
                        No students found.
                    </p>
                )}
            </div>
        </main>
    );
}

const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    fontSize: "14px",
};

const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "14px",
};
