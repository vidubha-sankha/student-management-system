"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

interface StudentRequest {
  id: string;
  type: string;
  subject: string;
  priority: "Standard" | "High" | "Urgent";
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  date: string;
  details: string;
}

const DEFAULT_REQUESTS: StudentRequest[] = [
  {
    id: "REQ-9012",
    type: "Transcript Request",
    subject: "Official Semester 1 Transcript for Internship",
    priority: "High",
    status: "Approved",
    date: "2026-10-12",
    details: "Required by internship sponsor before commencement date.",
  },
  {
    id: "REQ-9045",
    type: "Course Adjustment",
    subject: "Elective Module Transfer to Cloud Computing",
    priority: "Standard",
    status: "Under Review",
    date: "2026-10-14",
    details: "Course schedule adjustment due to project work commitments.",
  },
];

export default function StudentRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [type, setType] = useState("Transcript Request");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"Standard" | "High" | "Urgent">("Standard");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/student/login");
      return;
    }

    try {
      const stored = localStorage.getItem("campusflow_student_requests");
      if (stored) {
        setRequests(JSON.parse(stored));
      } else {
        setRequests(DEFAULT_REQUESTS);
        localStorage.setItem("campusflow_student_requests", JSON.stringify(DEFAULT_REQUESTS));
      }
    } catch {
      setRequests(DEFAULT_REQUESTS);
    }
  }, [router]);

  function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;

    const newReq: StudentRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      subject: subject.trim(),
      priority,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      details: details.trim(),
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    try {
      localStorage.setItem("campusflow_student_requests", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setShowModal(false);
    setSubject("");
    setDetails("");
    setMessage("Request submitted successfully to administration.");
    setTimeout(() => setMessage(""), 4000);
  }

  const filtered = requests.filter((r) => {
    if (filter === "ALL") return true;
    return r.status.toUpperCase() === filter;
  });

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">ACADEMIC SERVICES</div>
          <h1 className="page-title">Student Inquiries & Requests</h1>
          <p className="page-description">
            Submit formal requests for transcripts, course changes, and institutional letters.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + New Request
          </button>
          <Link href="/student/dashboard" className="btn-secondary">
            ← Dashboard
          </Link>
        </div>
      </div>

      {message && <div className="notice notice-success">{message}</div>}

      {/* Filter Tabs */}
      <div className="tab-list">
        {["ALL", "PENDING", "UNDER REVIEW", "APPROVED"].map((tab) => (
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

      {/* Requests List */}
      <div className="surface" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Request Type</th>
                <th>Subject & Notes</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Current Status</th>
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
                      <strong>{req.subject}</strong>
                      {req.details && (
                        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                          {req.details}
                        </div>
                      )}
                    </td>
                    <td>{req.date}</td>
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
                    <td>
                      <span
                        className={`badge ${
                          req.status === "Approved"
                            ? "badge-success"
                            : req.status === "Under Review"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty">
                    No requests found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="section-heading" style={{ marginBottom: 16 }}>
              <h2>Submit Academic Request</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: 0, fontSize: 18, color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form className="form-grid" onSubmit={handleCreateRequest}>
              <div>
                <label className="form-label">Request Type</label>
                <select
                  className="form-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Transcript Request">Official Academic Transcript</option>
                  <option value="Course Adjustment">Course / Module Adjustment</option>
                  <option value="Leave of Absence">Leave of Absence</option>
                  <option value="Recommendation Letter">Letter of Recommendation</option>
                  <option value="ID Card Replacement">Student ID Card Replacement</option>
                </select>
              </div>

              <div>
                <label className="form-label">Subject Line</label>
                <input
                  className="form-input"
                  placeholder="e.g. Request for semester 1 official results"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Priority Level</label>
                <select
                  className="form-input"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "Standard" | "High" | "Urgent")
                  }
                >
                  <option value="Standard">Standard (3-5 Business Days)</option>
                  <option value="High">High (48 Hours)</option>
                  <option value="Urgent">Urgent (24 Hours)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Additional Justification / Details</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Explain why this request is required..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
