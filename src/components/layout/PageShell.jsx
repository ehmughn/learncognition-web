import {
  Bell,
  BookOpen,
  FolderKanban,
  FolderPlus,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { teacherNav } from "../../constants/notifications.js";
import { AppLink } from "../ui/AppLink.jsx";
import { SecondaryButton } from "../ui/Button.jsx";

const navIcons = {
  "/": Home,
  "/dashboard": LayoutDashboard,
  "/notifications": Bell,
  "/create": FolderPlus,
  "/modules": FolderKanban,
  "/profile": UserRound,
  "/settings": Settings2,
  "/start": BookOpen,
};

function SidebarIcon({ path }) {
  const Icon = navIcons[path] ?? Home;
  return <Icon className="sidebar-link-icon" size={16} aria-hidden="true" />;
}

export function PageShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  wide = false,
}) {
  const { session, notifications, signOut, pathname } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div
      className={`teacher-shell ${wide ? "wide" : ""} ${sidebarCollapsed ? "collapsed" : ""}`.trim()}
    >
      <aside className="teacher-sidebar">
        <div className="brand-block">
          {!sidebarCollapsed && (
            <>
              <div className="brand-mark">LC</div>
              <div>
                <p className="brand-label">LearnCognition</p>
                <p className="brand-copy">Teacher and admin workspace</p>
              </div>
            </>
          )}
          <button
            type="button"
            className="icon-button sidebar-hamburger"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="profile-chip">
          <span>
            {session.authenticated
              ? session.name || "Ari Santos"
              : "Preview mode"}
          </span>
          <span>{session.authenticated ? session.role : "guest"}</span>
        </div>

        <nav className="sidebar-nav">
          {teacherNav.map((item) => (
            <AppLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${pathname === item.path ? "active" : ""}`}
            >
              <SidebarIcon path={item.path} />
              <span className="sidebar-link-label">{item.label}</span>
              {item.path === "/notifications" && unreadCount > 0 ? (
                <span className="sidebar-link-badge">{unreadCount}</span>
              ) : null}
            </AppLink>
          ))}
          <AppLink
            to="/start"
            className={`sidebar-link muted ${pathname === "/start" ? "active" : ""}`}
          >
            <SidebarIcon path="/start" />
            <span className="sidebar-link-label">Start guide</span>
          </AppLink>
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Notifications</p>
          <h3>{unreadCount} unread updates</h3>
          <p>Sharing, scores, and account activity land here first.</p>
        </div>

        <div className="sidebar-card subtle">
          <p className="eyebrow">Session</p>
          <p>
            {session.authenticated
              ? session.email
              : "Teacher preview with mock data"}
          </p>
          <SecondaryButton className="full-width" onClick={signOut}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </SecondaryButton>
        </div>
      </aside>

      <main className="teacher-main">
        <header className="page-topbar">
          <div className="page-topbar-heading">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
            </div>
          </div>
          <div className="topbar-actions">{actions}</div>
        </header>

        {!session.authenticated ? (
          <div className="preview-banner">
            You are viewing a static prototype. Sign in to simulate
            account-specific flows and save edits.
          </div>
        ) : null}

        <div className="mobile-nav">
          {teacherNav.map((item) => (
            <AppLink key={item.path} to={item.path} className="mobile-nav-link">
              {item.label}
            </AppLink>
          ))}
        </div>

        <section className="page-body">{children}</section>
      </main>
    </div>
  );
}
