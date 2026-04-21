import { useContext, createContext } from "react";
import { teacherNav } from "./content.js";
import { useApp } from "./AppProvider.jsx";

export function AppLink({
  to,
  className = "",
  replace = false,
  children,
  onClick,
  ...props
}) {
  const { navigate } = useApp();
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (onClick) onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigate(to, { replace });
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export function PrimaryButton({ className = "", children, ...props }) {
  return (
    <button className={`button button-primary ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ className = "", children, ...props }) {
  return (
    <button
      className={`button button-secondary ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className = "", children }) {
  return <div className={`panel ${className}`.trim()}>{children}</div>;
}

export function StatusPill({ tone = "neutral", children }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
    </label>
  );
}

export function Input(props) {
  return <input className="input" {...props} />;
}

export function Select(props) {
  return <select className="input" {...props} />;
}

export function TextArea(props) {
  return <textarea className="input textarea" {...props} />;
}

export function Modal({ title, children, footer, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Modal</p>
            <h3>{title}</h3>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export function PageShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  wide = false,
}) {
  const { session, notifications, signOut } = useApp();
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className={`teacher-shell ${wide ? "wide" : ""}`}>
      <aside className="teacher-sidebar">
        <div className="brand-block">
          <div className="brand-mark">LC</div>
          <div>
            <p className="brand-label">LearnCognition</p>
            <p className="brand-copy">Teacher and admin workspace</p>
          </div>
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
            <AppLink key={item.path} to={item.path} className="sidebar-link">
              {item.label}
            </AppLink>
          ))}
          <AppLink to="/start" className="sidebar-link muted">
            Start guide
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
            Sign out
          </SecondaryButton>
        </div>
      </aside>
      <main className="teacher-main">
        <header className="page-topbar">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {subtitle ? <p className="subtitle">{subtitle}</p> : null}
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

export function GuestShell({ kicker, title, subtitle, actions, children }) {
  const { navigate } = useApp();
  return (
    <div className="guest-shell">
      <div className="guest-backdrop backdrop-a" />
      <div className="guest-backdrop backdrop-b" />
      <div className="guest-frame">
        <header className="guest-topbar">
          <AppLink to="/" className="guest-brand">
            <span className="guest-brand-mark">LC</span>
            <span>
              <strong>LearnCognition</strong>
              <small>Static prototype</small>
            </span>
          </AppLink>
          <div className="guest-top-actions">
            <AppLink to="/login" className="text-link">
              Login
            </AppLink>
            <AppLink to="/register" className="text-link">
              Register
            </AppLink>
            <SecondaryButton onClick={() => navigate("/start")}>
              Open start guide
            </SecondaryButton>
          </div>
        </header>
        <div className="guest-content">
          <div className="guest-copy">
            <p className="eyebrow">{kicker}</p>
            <h1>{title}</h1>
            {subtitle ? <p className="subtitle large">{subtitle}</p> : null}
            {actions ? <div className="hero-actions">{actions}</div> : null}
          </div>
          <div className="guest-panel">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function MetricStrip({ items }) {
  return (
    <div className="metric-strip">
      {items.map((item) => (
        <div className="metric-card" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
