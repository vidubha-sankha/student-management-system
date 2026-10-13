
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
    id: number;
    name: string;
    description: string;
};

const API_URL = "http://localhost:8080/api/courses";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadCourses() {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                cache: "no-store",
            });
            if (!response.ok) {
                throw new Error("Failed to load courses");
            }
            setCourses(await response.json());
            setError("");
        } catch {
            setError("Cannot load courses from backend.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadCourses();
    }, []);

    function resetForm() {
        setName("");
        setDescription("");
        setEditingId(null);
    }

    function editCourse(course: Course) {
        setEditingId(course.id);
        setName(course.name);
        setDescription(course.description ?? "");
        setMessage("");
        setError("");
    }

    async function saveCourse(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                editingId === null ? API_URL : `${API_URL}/${editingId}`,
                {
                    method: editingId === null ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Save failed");
            }

            setMessage(
                editingId === null
                    ? "Course added successfully!"
                    : "Course updated successfully!"
            );
            resetForm();
            await loadCourses();
        } catch {
            setError("Failed to save course.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteCourse(course: Course) {
        if (!window.confirm(`Delete ${course.name}?`)) return;

        setError("");
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/${course.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            setMessage("Course deleted successfully!");
            await loadCourses();
        } catch {
            setError(
                "Failed to delete course. It may be assigned to students."
            );
        }
    }

    return (
        <main style={{
            maxWidth: 1100,
            margin: "40px auto",
            padding: "0 20px",
            color: "#111827",
        }}>
            <Link href="/" style={{ color: "#2563eb" }}>
                ← Back to Dashboard
            </Link>

            <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 24 }}>
                Course Management
            </h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>
                Manage all courses in the Student Management System.
            </p>

            <section style={cardStyle}>
                <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
                    {editingId === null ? "Add New Course" : "Edit Course"}
                </h2>

                <form onSubmit={saveCourse} style={{
                    display: "grid",
                    gap: 16,
                }}>
                    <div>
                        <label htmlFor="course-name">Course Name</label>
                        <input
                            id="course-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Software Engineering"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label htmlFor="course-description">Description</label>
                        <textarea
                            id="course-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter course description"
                            style={{ ...inputStyle, minHeight: 90 }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <button type="submit" disabled={saving} style={buttonStyle}>
                            {saving
                                ? "Saving..."
                                : editingId === null
                                    ? "Add Course"
                                    : "Update Course"}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{ ...buttonStyle, background: "#64748b" }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section style={{ ...cardStyle, marginTop: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
                    All Courses ({courses.length})
                </h2>

                {message && (
                    <p role="status" style={{ color: "green", marginBottom: 12 }}>
                        {message}
                    </p>
                )}
                {error && (
                    <p role="alert" style={{ color: "red", marginBottom: 12 }}>
                        {error}
                    </p>
                )}

                {loading ? (
                    <p>Loading courses...</p>
                ) : courses.length === 0 ? (
                    <p>No courses found.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            textAlign: "left",
                        }}>
                            <thead>
                                <tr>
                                    {["ID", "Course Name", "Description", "Actions"].map(
                                        (heading) => (
                                            <th key={heading} style={cellStyle}>
                                                {heading}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td style={cellStyle}>{course.id}</td>
                                        <td style={cellStyle}>{course.name}</td>
                                        <td style={cellStyle}>{course.description}</td>
                                        <td style={cellStyle}>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button
                                                    onClick={() => editCourse(course)}
                                                    style={buttonStyle}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteCourse(course)}
                                                    style={{
                                                        ...buttonStyle,
                                                        background: "#dc2626",
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

const cardStyle: React.CSSProperties = {
    background: "white",
    padding: 24,
    borderRadius: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    marginTop: 6,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    color: "#111827",
    background: "white",
};

const buttonStyle: React.CSSProperties = {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 7,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
};

const cellStyle: React.CSSProperties = {
    padding: "14px 10px",
    borderBottom: "1px solid #e2e8f0",
};
