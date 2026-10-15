
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
type NotificationFilter = "ALL" | "UNREAD" | "REQUESTS";

interface ChangeRequest {
  id: number;
  studentId: number;
  studentName: string;
  fieldName: "name" | "email" | "course";
  newValue: string;
  reason: string;
  status: RequestStatus;
  adminComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  category: "Request";
  status: RequestStatus;
  read: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export default function StudentNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [filter, setFilter] =
    useState<NotificationFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [storageKey, setStorageKey] = useState("");
  const [readIds, setReadIds] = useState<string[]>([]);

  // Load real request data from backend
  const loadNotifications = useCallback(async (
    key: string,
    savedReadIds: string[]
  ) => {
    const token = getToken();

    if (!token) return;

    setLoading(true);
    setError("");

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

      if (response.status === 401) {
        router.replace("/student/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load notifications."
        );
      }

      const requests: ChangeRequest[] =
        await response.json();

      const generated: NotificationItem[] =
        requests.map((request) => {
          const fieldNames = {
            name: "Name",
            email: "Email",
            course: "Course",
          };

          const field =
            fieldNames[request.fieldName] ||
            "Profile";

          let title = "";
          let message = "";

          if (request.status === "APPROVED") {
            title = `${field} Change Request Approved`;

            message =
              `Your ${field.toLowerCase()} change ` +
              `request has been approved.`;

          } else if (request.status === "REJECTED") {
            title = `${field} Change Request Rejected`;

            message =
              `Your ${field.toLowerCase()} change ` +
              `request has been rejected.`;

          } else {
            title = `${field} Change Request Submitted`;

            message =
              `Your ${field.toLowerCase()} change ` +
              `request is awaiting administrator review.`;
          }

          if (request.adminComment) {
            message +=
              ` Admin comment: ${request.adminComment}`;
          }

          // Include status in ID so a new review
          // decision creates a new unread notification.
          const notificationId =
            `request-${request.id}-${request.status}`;

          return {
            id: notificationId,
            title,
            message,
            date:
              request.reviewedAt ||
              request.createdAt,
            category: "Request",
            status: request.status,
            read: savedReadIds.includes(notificationId),
          };
        });

      generated.sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

      setNotifications(generated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Authentication and initial loading
  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || user?.role !== "STUDENT") {
      router.replace("/student/login");
      return;
    }

    // Use account-specific storage key
    const key =
      `campusflow_read_notifications_${user.email}`;

    setStorageKey(key);

    let savedReadIds: string[] = [];

    try {
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) => typeof item === "string"
          )
        ) {
          savedReadIds = parsed;
        }
      }
    } catch {
      savedReadIds = [];
    }

    setReadIds(savedReadIds);

    void loadNotifications(key, savedReadIds);
  }, [router, loadNotifications]);

  // Save read status locally
  function saveReadIds(ids: string[]) {
    setReadIds(ids);

    try {
      if (storageKey) {
        localStorage.setItem(
          storageKey,
          JSON.stringify(ids)
        );
      }
    } catch {
      // Browser storage may be unavailable.
    }
  }

  // Mark one notification as read
  function markAsRead(id: string) {
    const updatedIds = Array.from(
      new Set([...readIds, id])
    );

    saveReadIds(updatedIds);

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  // Mark all notifications as read
  function markAllRead() {
    const updatedIds = Array.from(
      new Set([
        ...readIds,
        ...notifications.map((item) => item.id),
      ])
    );

    saveReadIds(updatedIds);

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read
      ).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    return notifications;
  }, [notifications, filter]);

  function formatDate(value: string) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  }

  function statusBadge(status: RequestStatus) {
    if (status === "APPROVED") {
      return "badge-success";
    }

    if (status === "REJECTED") {
      return "badge-danger";
    }

    return "badge-warning";
  }

  return (
    <main className="app-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">
            COMMUNICATION CENTER
          </div>

          <h1 className="page-title">
            Campus Notifications
          </h1>

          <p className="page-description">
            Stay updated on your profile change
            requests and administrator decisions.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={markAllRead}
            >
              Mark all as read
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              loadNotifications(storageKey, readIds)
            }
            disabled={loading || !storageKey}
          >
            Refresh
          </button>

          <Link
            href="/student/dashboard"
            className="btn-soft"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="tab-list">
        <button
          type="button"
          className={`tab-btn ${filter === "ALL" ? "active" : ""
            }`}
          onClick={() => setFilter("ALL")}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${filter === "UNREAD" ? "active" : ""
            }`}
          onClick={() => setFilter("UNREAD")}
        >
          Unread ({unreadCount})
        </button>

        <button
          type="button"
          className={`tab-btn ${filter === "REQUESTS" ? "active" : ""
            }`}
          onClick={() => setFilter("REQUESTS")}
        >
          Requests
        </button>
      </div>

      {/* Notification List */}
      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        {loading ? (
          <div className="surface empty">
            <p>Loading notifications...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="surface"
              style={{
                padding: 20,
                borderLeft: item.read
                  ? "1px solid #e8ecf3"
                  : "4px solid #4f46e5",
                background: item.read
                  ? "#ffffff"
                  : "#fbfbfe",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className={`badge ${statusBadge(item.status)
                      }`}
                  >
                    {item.status}
                  </span>

                  <span
                    className="muted"
                    style={{ fontSize: 12 }}
                  >
                    {formatDate(item.date)}
                  </span>

                  {!item.read && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#4f46e5",
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>

                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: 16,
                    fontWeight: item.read
                      ? 600
                      : 800,
                    color: item.read
                      ? "#334155"
                      : "#0f172a",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#64748b",
                    lineHeight: 1.5,
                  }}
                >
                  {item.message}
                </p>
              </div>

              {!item.read && (
                <button
                  type="button"
                  className="btn-soft"
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                  onClick={() =>
                    markAsRead(item.id)
                  }
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="surface empty">
            <p>
              {filter === "UNREAD"
                ? "No unread notifications."
                : "No notifications available."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
