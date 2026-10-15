"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  category: "Academic" | "System" | "Event" | "Finance";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "NOTIF-1",
    title: "Mid-Term Examination Timetable Published",
    message: "The official timetable for Semester 1 evaluations has been posted. Please check your assigned examination hall.",
    date: "Today at 09:30 AM",
    category: "Academic",
    read: false,
  },
  {
    id: "NOTIF-2",
    title: "Course Registration Confirmed",
    message: "Your enrollment in the current academic semester modules has been validated by the Faculty Registrar.",
    date: "Yesterday at 04:15 PM",
    category: "System",
    read: false,
  },
  {
    id: "NOTIF-3",
    title: "Annual Tech Symposium & Career Fair",
    message: "Join top engineering & computing industry leaders on Campus Hall A this coming Friday at 10:00 AM.",
    date: "Oct 12, 2026",
    category: "Event",
    read: true,
  },
  {
    id: "NOTIF-4",
    title: "Library Book Loan Renewal Notice",
    message: "Two books on Modern Software Architecture are scheduled for return on Oct 20. Renew online if needed.",
    date: "Oct 10, 2026",
    category: "Academic",
    read: true,
  },
];

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "ACADEMIC">("ALL");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/student/login");
      return;
    }

    try {
      const stored = localStorage.getItem("campusflow_student_notifs");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem("campusflow_student_notifs", JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  }, [router]);

  function markAsRead(id: string) {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    try {
      localStorage.setItem("campusflow_student_notifs", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  function markAllRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem("campusflow_student_notifs", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "ACADEMIC") return n.category === "Academic";
    return true;
  });

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="page-eyebrow">COMMUNICATION CENTER</div>
          <h1 className="page-title">Campus Notifications</h1>
          <p className="page-description">
            Stay up to date with faculty announcements, course updates, and exam alerts.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={markAllRead}
            >
              Mark all as read
            </button>
          )}
          <Link href="/student/dashboard" className="btn-soft">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-list">
        <button
          type="button"
          className={`tab-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filter === "UNREAD" ? "active" : ""}`}
          onClick={() => setFilter("UNREAD")}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          className={`tab-btn ${filter === "ACADEMIC" ? "active" : ""}`}
          onClick={() => setFilter("ACADEMIC")}
        >
          Academic
        </button>
      </div>

      {/* Notification List */}
      <div style={{ display: "grid", gap: 14 }}>
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="surface"
              style={{
                padding: 20,
                borderLeft: item.read ? "1px solid #e8ecf3" : "4px solid #4f46e5",
                background: item.read ? "#ffffff" : "#fbfbfe",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span
                    className={`badge ${
                      item.category === "Academic"
                        ? "badge-info"
                        : item.category === "Event"
                        ? "badge-warning"
                        : "badge-neutral"
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {item.date}
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
                    fontWeight: item.read ? 600 : 800,
                    color: item.read ? "#334155" : "#0f172a",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
                  {item.message}
                </p>
              </div>

              {!item.read && (
                <button
                  type="button"
                  className="btn-soft"
                  style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
                  onClick={() => markAsRead(item.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="surface empty">
            <p>No notifications in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
}
