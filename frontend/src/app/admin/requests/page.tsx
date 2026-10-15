"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

interface AdminRequestItem {
  id: string;
  studentName?: string;
  type: string;
  subject: string;
  priority: "Standard" | "High" | "Urgent";
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  date: string;
  details: string;
}

const DEFAULT_ADMIN_REQUESTS: AdminRequestItem[] = [
  {
    id: "REQ-9012",
    studentName: "Kasun Perera",
    type: "Transcript Request",
    subject: "Official Semester 1 Transcript for Internship",
    priority: "High",
    status: "Approved",
    date: "2026-10-12",
    details: "Required by internship sponsor before commencement date.",
  },
  {
    id: "REQ-9045",
    studentName: "Nimal Fernando",
    type: "Course Adjustment",
    subject: "Elective Module Transfer to Cloud Computing",
    priority: "Standard",
    status: "Pending",
    date: "2026-10-14",
    details: "Course schedule adjustment due to project work commitments.",
  },
  {
    id: "REQ-9088",
    studentName: "Dilani Silva",
    type: "Leave of Absence",
    subject: "Medical Leave Request for 2 Weeks",
    priority: "Urgent",
    status: "Pending",
    date: "2026-10-14",
    details: "Medical certificate provided to faculty health center.",
  },
];

export default function AdminRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }

    try {
      const stored = localStorage.getItem("campusflow_student_requests");
      if (stored) {
        setRequests(JSON.parse(stored));
      } else {
        setRequests(DEFAULT_ADMIN_REQUESTS);
        localStorage.setItem("campusflow_student_requests", JSON.stringify(DEFAULT_ADMIN_REQUESTS));
      }
    } catch {
      setRequests(DEFAULT_ADMIN_REQUESTS);
    }
  }, [router]);

  function updateStatus(id: string, newStatus: "Approved" | "Rejected" | "Under Review") {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setRequests(updated);
    try {
      localStorage.setItem("campusflow_student_requests", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNotice(`Request ${id} marked as ${newStatus}.`);
    setTimeout(() => setNotice(""), 3500);
  }

  const pendingCount = requests.filter((r) => r.status === "Pending" || r.status === "Under Review").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;

  const filtered = requests.filter((r) => {
    if (filter === "ALL") return true;
    return r.status.toUpperCase() === filter;
  });

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">REGISTRAR OPERATIONS</div>
          <h1 className="page-title">Student Requests & Approvals</h1>
          <p className="page-description">
            Review academic petitions, authorize transcript disbursements, and adjudicate leave requests.
          </p>
        </div>

        <Link href="/admin/dashboard" className="btn-secondary">
          ← Dashboard
        </Link>
      </div>

      {notice && <div className="notice notice-success">{notice}</div>}

      {/* Metrics Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">{requests.length}</span>
            <span className="stat-label">Total Inquiries</span>
          </div>
          <div className="stat-icon-wrap" style={{ background: "#e0e7ff", color: "#4338ca" }}>
            📑
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Awaiting Decision</span>
          </div>
          <div className="stat-icon-wrap" style={{ background: "#fef3c7", color: "#b45309" }}>
            ⏳
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-value">{approvedCount}</span>
            <span className="stat-label">Authorized Approvals</span>
          </div>
          <div className="stat-icon-wrap" style={{ background: "#dcfce7", color: "#166534" }}>
            ✅
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-list">
        {["ALL", "PENDING", "UNDER REVIEW", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <section className="surface" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Request Type</th>
                <th>Student / Details</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Decision Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <strong style={{ color: "#4f46e5" }}>{req.id}</strong>
                    </td>
                    <td>{req.type}</td>
                    <td>
                      <div>
                        <strong>{req.subject}</strong>
                      </div>
                      {req.details && (
                        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                          {req.details}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          req.priority === "Urgent"
                            ? "badge-danger"
                            : req.priority === "High"
                            ? "badge-warning"
                            : "badge-neutral"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="muted">{req.date}</td>
                    <td>
                      <span
                        className={`badge ${
                          req.status === "Approved"
                            ? "badge-success"
                            : req.status === "Rejected"
                            ? "badge-danger"
                            : req.status === "Under Review"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        {req.status !== "Approved" && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: "5px 10px", fontSize: 12 }}
                            onClick={() => updateStatus(req.id, "Approved")}
                          >
                            Approve
                          </button>
                        )}
                        {req.status !== "Under Review" && req.status !== "Approved" && (
                          <button
                            type="button"
                            className="btn-soft"
                            style={{ padding: "5px 10px", fontSize: 12 }}
                            onClick={() => updateStatus(req.id, "Under Review")}
                          >
                            Review
                          </button>
                        )}
                        {req.status !== "Rejected" && (
                          <button
                            type="button"
                            className="btn-danger"
                            style={{ padding: "5px 10px", fontSize: 12 }}
                            onClick={() => updateStatus(req.id, "Rejected")}
                          >
                            Reject
                          </button>
                        )}
                      </div>
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
