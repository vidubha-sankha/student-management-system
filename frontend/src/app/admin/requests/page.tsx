
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
type ChangeField = "name" | "email" | "course";
type FilterStatus = "ALL" | RequestStatus;

interface AdminRequestItem {
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
}

interface Course {
  id: number;
  name: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export default function AdminRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  // Admin comment for each request
  const [comments, setComments] = useState<Record<number, string>>({});

  // Load requests from Spring Boot
  const loadRequests = useCallback(async () => {
    const token = getToken();

    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Access denied. Admin account required."
            : "Failed to load student requests."
        );
      }

      const data: AdminRequestItem[] = await response.json();

      setRequests(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load requests."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Check admin login and load data
  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || user?.role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }

    void loadRequests();

    async function loadCourses() {
      try {
        const response = await fetch(
          `${API_URL}/api/courses`
        );

        if (response.ok) {
          const data: Course[] = await response.json();
          setCourses(data);
        }
      } catch {
        // Course names are optional for displaying requests.
      }
    }

    void loadCourses();
  }, [router, loadRequests]);

  // Approve or reject using real backend API
  async function updateStatus(
    id: number,
    newStatus: "APPROVED" | "REJECTED"
  ) {
    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const action =
      newStatus === "APPROVED" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${action} request #${id}?`
      )
    ) {
      return;
    }

    setReviewingId(id);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/requests/${id}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            adminComment: comments[id]?.trim() || null,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
          `Unable to ${action} request.`
        );
      }

      setNotice(
        `Request #${id} successfully ${newStatus === "APPROVED"
          ? "approved"
          : "rejected"
        }.`
      );

      // Refresh real database records
      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setReviewingId(null);
    }
  }

  function fieldLabel(field: ChangeField) {
    switch (field) {
      case "name":
        return "Name Change";
      case "email":
        return "Email Change";
      case "course":
        return "Course Change";
      default:
        return "Profile Change";
    }
  }

  function displayValue(request: AdminRequestItem) {
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

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  const pendingCount = requests.filter(
    (r) => r.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (r) => r.status === "APPROVED"
  ).length;

  const filtered = requests.filter((r) => {
    return filter === "ALL" || r.status === filter;
  });

  return (
    <main className="app-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">
            REGISTRAR OPERATIONS
          </div>

          <h1 className="page-title">
            Student Requests & Approvals
          </h1>

          <p className="page-description">
            Review student profile change requests,
            approve or reject changes, and provide
            administrator feedback.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="btn-secondary"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Success Message */}
      {notice && (
        <div className="notice notice-success">
          {notice}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Metrics Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {requests.length}
            </span>
            <span className="stat-label">
              Total Requests
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#e0e7ff",
              color: "#4338ca",
            }}
          >
            📑
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {pendingCount}
            </span>
            <span className="stat-label">
              Awaiting Decision
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#fef3c7",
              color: "#b45309",
            }}
          >
            ⏳
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">
              {approvedCount}
            </span>
            <span className="stat-label">
              Approved Requests
            </span>
          </div>

          <div
            className="stat-icon-wrap"
            style={{
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            ✅
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-list">
        {(
          [
            "ALL",
            "PENDING",
            "APPROVED",
            "REJECTED",
          ] as FilterStatus[]
        ).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-btn ${filter === tab ? "active" : ""
              }`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <section
        className="surface"
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Request Type</th>
                <th>Student / Details</th>
                <th>New Value</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>
                  Decision Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty">
                    Loading requests...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((req) => (
                  <tr key={req.id}>
                    {/* Request ID */}
                    <td>
                      <strong
                        style={{ color: "#4f46e5" }}
                      >
                        REQ-{String(req.id).padStart(4, "0")}
                      </strong>
                    </td>

                    {/* Request Type */}
                    <td>
                      {fieldLabel(req.fieldName)}
                    </td>

                    {/* Student and Reason */}
                    <td>
                      <div>
                        <strong>
                          {req.studentName}
                        </strong>
                      </div>

                      <div
                        className="muted"
                        style={{
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        Student ID: {req.studentId}
                      </div>

                      <div
                        className="muted"
                        style={{
                          fontSize: 13,
                          marginTop: 6,
                        }}
                      >
                        {req.reason}
                      </div>

                      {req.adminComment && (
                        <div
                          style={{
                            fontSize: 12,
                            marginTop: 8,
                            color: "#475569",
                          }}
                        >
                          <strong>
                            Admin Comment:
                          </strong>{" "}
                          {req.adminComment}
                        </div>
                      )}
                    </td>

                    {/* New Value */}
                    <td>
                      <strong>
                        {displayValue(req)}
                      </strong>
                    </td>

                    {/* Date */}
                    <td className="muted">
                      {formatDate(req.createdAt)}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge ${req.status === "APPROVED"
                            ? "badge-success"
                            : req.status === "REJECTED"
                              ? "badge-danger"
                              : "badge-info"
                          }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      {req.status === "PENDING" ? (
                        <div
                          style={{
                            display: "grid",
                            gap: 8,
                            minWidth: 170,
                          }}
                        >
                          <textarea
                            className="form-input"
                            rows={2}
                            placeholder="Admin comment (optional)"
                            value={comments[req.id] ?? ""}
                            onChange={(e) =>
                              setComments((prev) => ({
                                ...prev,
                                [req.id]: e.target.value,
                              }))
                            }
                            disabled={reviewingId === req.id}
                            style={{
                              width: "100%",
                              fontSize: 12,
                              resize: "vertical",
                            }}
                          />

                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={reviewingId !== null}
                              onClick={() =>
                                updateStatus(
                                  req.id,
                                  "APPROVED"
                                )
                              }
                              style={{
                                padding: "7px 10px",
                                fontSize: 12,
                              }}
                            >
                              {reviewingId === req.id
                                ? "Saving..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="btn-danger"
                              disabled={reviewingId !== null}
                              onClick={() =>
                                updateStatus(
                                  req.id,
                                  "REJECTED"
                                )
                              }
                              style={{
                                padding: "7px 10px",
                                fontSize: 12,
                              }}
                            >
                              {reviewingId === req.id
                                ? "Saving..."
                                : "Reject"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className="muted"
                          style={{ fontSize: 12 }}
                        >
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty">
                    No requests found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
