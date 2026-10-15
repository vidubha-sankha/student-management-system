
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";

type ChangeField = "name" | "email" | "course";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type Course = {
  id: number;
  name: string;
  description?: string | null;
};

type ChangeRequest = {
  id: number;
  studentId: number;
  studentName: string;
  fieldName: ChangeField;
  newValue: string;
  reason: string;
  status: RequestStatus;
  adminComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export default function StudentRequestsPage() {
  const router = useRouter();

  const [field, setField] = useState<ChangeField>("name");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load student's requests
  const loadRequests = useCallback(async () => {
    const token = getToken();

    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/student/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Session expired or access denied. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Failed to load request history.");
      }

      const data: ChangeRequest[] = await response.json();

      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication and initial data loading
  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || user?.role !== "STUDENT") {
      router.replace("/student/login");
      return;
    }

    void loadRequests();

    // Load courses for course change requests
    async function loadCourses() {
      try {
        const response = await fetch(
          `${API_URL}/api/courses`
        );

        if (!response.ok) {
          throw new Error("Unable to load courses.");
        }

        const data: Course[] = await response.json();
        setCourses(data);
      } catch (err) {
        console.error("Course loading error:", err);
      }
    }

    void loadCourses();
  }, [router, loadRequests]);

  // Submit new change request
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = getToken();

    if (!token) {
      router.replace("/student/login");
      return;
    }

    if (!newValue.trim() || !reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (newValue.trim().length > 255) {
      setError("New value must be 255 characters or fewer.");
      return;
    }

    if (reason.trim().length > 1000) {
      setError("Reason must be 1000 characters or fewer.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/student/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fieldName: field,
            newValue: newValue.trim(),
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const validationErrors = data?.errors
          ? Object.values(data.errors).join(", ")
          : "";

        throw new Error(
          validationErrors ||
          data?.message ||
          "Failed to submit change request."
        );
      }

      setSuccess(
        "Change request submitted successfully! Waiting for admin approval."
      );

      setNewValue("");
      setReason("");

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  function fieldLabel(value: ChangeField) {
    switch (value) {
      case "name":
        return "Student Name";
      case "email":
        return "Email Address";
      case "course":
        return "Registered Course";
    }
  }

  function displayValue(request: ChangeRequest) {
    if (request.fieldName === "course") {
      const course = courses.find(
        (item) => String(item.id) === request.newValue
      );

      return course
        ? `${course.name} (ID: ${course.id})`
        : `Course ID: ${request.newValue}`;
    }

    return request.newValue;
  }

  function statusStyle(status: RequestStatus) {
    switch (status) {
      case "APPROVED":
        return {
          background: "#dcfce7",
          color: "#166534",
        };
      case "REJECTED":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };
      default:
        return {
          background: "#fef3c7",
          color: "#92400e",
        };
    }
  }

  return (
    <main className="app-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">
            STUDENT SERVICES
          </div>

          <h1 className="page-title">
            Profile Change Requests
          </h1>

          <p className="page-description">
            Request changes to your student information.
            Changes require administrator approval.
          </p>
        </div>

        <Link
          href="/student/dashboard"
          className="btn-secondary"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Centered Request Form */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: 36,
          marginBottom: 36,
        }}
      >
        <section
          className="surface"
          style={{
            width: "100%",
            maxWidth: 720,
            padding: 36,
            borderRadius: 20,
            boxShadow:
              "0 12px 35px rgba(15, 23, 42, 0.06)",
          }}
        >
          {/* Form Heading */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: "#eef2ff",
                color: "#4f46e5",
                display: "grid",
                placeItems: "center",
                fontSize: 28,
                margin: "0 auto 16px",
              }}
            >
              📝
            </div>

            <h2
              style={{
                fontSize: 25,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              New Change Request
            </h2>

            <p
              className="muted"
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              Fill out the form below to request
              changes to your student information.
            </p>
          </div>

          {/* Information Notice */}
          <div
            style={{
              background: "#f0f4ff",
              border: "1px solid #dbe4ff",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 28,
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#4338ca" }}>
              Note:
            </strong>{" "}
            Your request will be saved and reviewed
            by an administrator. Profile changes are
            applied only after approval.
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              style={{
                padding: 14,
                borderRadius: 10,
                background: "#fef2f2",
                color: "#b91c1c",
                marginBottom: 20,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              role="status"
              style={{
                padding: 14,
                borderRadius: 10,
                background: "#f0fdf4",
                color: "#166534",
                marginBottom: 20,
                fontSize: 14,
              }}
            >
              {success}
            </div>
          )}

          {/* Request Form */}
          <form
            onSubmit={handleSubmit}
            className="form-grid"
            style={{
              display: "grid",
              gap: 22,
            }}
          >
            {/* Field Selection */}
            <div>
              <label
                className="form-label"
                htmlFor="change-field"
              >
                Field to Change
              </label>

              <select
                id="change-field"
                className="form-input"
                style={{
                  width: "100%",
                  minHeight: 52,
                }}
                value={field}
                onChange={(e) => {
                  setField(e.target.value as ChangeField);
                  setNewValue("");
                  setError("");
                  setSuccess("");
                }}
              >
                <option value="name">
                  Student Name
                </option>

                <option value="email">
                  Email Address
                </option>

                <option value="course">
                  Registered Course
                </option>
              </select>
            </div>

            {/* New Value */}
            <div>
              <label
                className="form-label"
                htmlFor="new-value"
              >
                New Value
              </label>

              {field === "course" ? (
                <select
                  id="new-value"
                  className="form-input"
                  style={{
                    width: "100%",
                    minHeight: 52,
                  }}
                  value={newValue}
                  onChange={(e) =>
                    setNewValue(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select a course
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={String(course.id)}
                    >
                      {course.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="new-value"
                  className="form-input"
                  style={{
                    width: "100%",
                    minHeight: 52,
                  }}
                  type={
                    field === "email"
                      ? "email"
                      : "text"
                  }
                  maxLength={255}
                  placeholder={
                    field === "name"
                      ? "Enter your new full name"
                      : "Enter your new email address"
                  }
                  value={newValue}
                  onChange={(e) =>
                    setNewValue(e.target.value)
                  }
                  required
                />
              )}
            </div>

            {/* Reason */}
            <div>
              <label
                className="form-label"
                htmlFor="change-reason"
              >
                Reason for Change
              </label>

              <textarea
                id="change-reason"
                className="form-input"
                style={{
                  width: "100%",
                  minHeight: 130,
                  resize: "vertical",
                  padding: 14,
                }}
                maxLength={1000}
                placeholder="Explain why you need this change..."
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{
                width: "100%",
                minHeight: 52,
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 12,
                marginTop: 4,
                opacity: submitting ? 0.65 : 1,
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {submitting
                ? "Submitting..."
                : "Submit Change Request →"}
            </button>
          </form>
        </section>
      </div>

      {/* Request History */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginBottom: 50,
        }}
      >
        <section
          className="surface"
          style={{
            width: "100%",
            maxWidth: 720,
            padding: 28,
            borderRadius: 18,
          }}
        >
          <div className="section-heading">
            <h2>My Request History</h2>
          </div>

          {loading ? (
            <div
              className="empty"
              style={{ padding: 30 }}
            >
              Loading request history...
            </div>
          ) : requests.length === 0 ? (
            <div
              className="empty"
              style={{
                textAlign: "center",
                padding: "35px 15px",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 12,
                }}
              >
                📋
              </div>

              <p style={{ margin: 0 }}>
                No change requests submitted yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 16,
                marginTop: 20,
              }}
            >
              {requests.map((request) => (
                <article
                  key={request.id}
                  style={{
                    padding: 20,
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 12,
                    }}
                  >
                    <strong>
                      {fieldLabel(request.fieldName)}
                    </strong>

                    <span
                      style={{
                        ...statusStyle(request.status),
                        padding: "6px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {request.status}
                    </span>
                  </div>

                  <p style={{ marginBottom: 8 }}>
                    <strong>Requested Value:</strong>{" "}
                    {displayValue(request)}
                  </p>

                  <p
                    className="muted"
                    style={{
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    <strong>Reason:</strong>{" "}
                    {request.reason}
                  </p>

                  {request.adminComment && (
                    <p
                      style={{
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      <strong>Admin Comment:</strong>{" "}
                      {request.adminComment}
                    </p>
                  )}

                  <p
                    className="muted"
                    style={{
                      fontSize: 12,
                      marginBottom: 0,
                    }}
                  >
                    Submitted:{" "}
                    {formatDate(request.createdAt)}

                    {request.reviewedAt && (
                      <>
                        {" | Reviewed: "}
                        {formatDate(request.reviewedAt)}
                      </>
                    )}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
