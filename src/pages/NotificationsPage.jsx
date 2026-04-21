import { Bell, CheckCheck, MailOpen } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";

export default function NotificationsPage() {
  const { notifications, setNotifications, showToast, navigate } = useApp();
  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      })),
    );
    showToast("All notifications marked as read.");
  };

  return (
    <PageShell
      eyebrow="Notifications"
      title="Notifications"
      actions={
        <>
          <SecondaryButton onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck size={16} aria-hidden="true" />
            Mark all read
          </SecondaryButton>
          <PrimaryButton onClick={() => navigate("/")}>
            <Bell size={16} aria-hidden="true" />
            Home
          </PrimaryButton>
        </>
      }
    >
      <div className="content-grid notifications-grid">
        <Card className="notifications-hero">
          <div className="notifications-hero-copy">
            <StatusPill tone="accent">{unreadCount} unread</StatusPill>
            <h3>Track every share, score, and class update in one place.</h3>
            <p>
              Notifications arrive here first so you can quickly review what
              changed, what needs attention, and what is ready to share.
            </p>
          </div>
          <div className="notifications-hero-metrics">
            <div>
              <strong>{notifications.length}</strong>
              <span>Total updates</span>
            </div>
            <div>
              <strong>{unreadCount}</strong>
              <span>Unread items</span>
            </div>
            <div>
              <strong>
                {notifications.filter((item) => item.read).length}
              </strong>
              <span>Read items</span>
            </div>
          </div>
        </Card>

        <Card className="notifications-panel dashboard-table-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Activity feed</p>
              <h3>Recent notifications</h3>
            </div>
            <StatusPill tone="neutral">Live feed</StatusPill>
          </div>

          <ul className="notification-list">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={`notification-item ${item.read ? "" : "unread"}`.trim()}
              >
                <div className="notification-copy">
                  <div className="notification-title-row">
                    <strong>{item.title}</strong>
                    {!item.read ? (
                      <StatusPill tone="accent">New</StatusPill>
                    ) : (
                      <StatusPill tone="neutral">Read</StatusPill>
                    )}
                  </div>
                  <p>{item.message}</p>
                </div>
                <div className="notification-meta">
                  <MailOpen size={16} aria-hidden="true" />
                  <span>{item.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
