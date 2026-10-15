
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";

type ChangeField = "name" | "email" | "course";

export default function StudentRequestsPage() {
  const router = useRouter();

  const [field, setField] = useState<ChangeField>("name");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || user?.role !== "STUDENT") {
      router.replace("/student/login");
    }
  }, [router]);

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
            padding: "36px",
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
            Request submission is being connected
            to the backend. No changes will be
            saved yet.
          </div>

          {/* Request Form */}
          <form
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
                  setField(
                    e.target.value as ChangeField
                  );
                  setNewValue("");
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
                placeholder={
                  field === "name"
                    ? "Enter your new full name"
                    : field === "email"
                      ? "Enter your new email address"
                      : "Enter your requested course"
                }
                value={newValue}
                onChange={(e) =>
                  setNewValue(e.target.value)
                }
                required
              />
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
              type="button"
              className="btn-primary"
              disabled
              title="Backend integration pending"
              style={{
                width: "100%",
                minHeight: 52,
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 12,
                marginTop: 4,
              }}
            >
              Submit Change Request →
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
              Request history will appear here
              after backend integration.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
