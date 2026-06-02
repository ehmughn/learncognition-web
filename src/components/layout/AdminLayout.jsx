import {
  BarChart3,
  LogOut,
  Menu,
  Settings,
  Users,
  TrendingUp,
  FileText,
  Database,
  UserCog,
} from "lucide-react";
import { useApp, usePersistentState } from "../../context/AppContext.jsx";
import { AppLink } from "../ui/AppLink.jsx";
import { SecondaryButton } from "../ui/Button.jsx";
const adminNavItems = [
  { path: "/admin", label: "Dashboard", icon: BarChart3 },
  { path: "/admin/accounts", label: "Manage Accounts", icon: Users },
  { path: "/admin/teachers", label: "Teachers", icon: UserCog },
  { path: "/admin/parents", label: "Parents", icon: Users },
  { path: "/admin/students", label: "Students", icon: Users },
  { path: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/admin/items", label: "Items", icon: Database },
];

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

export function AdminLayout({ title, subtitle, children, actions }) {
  const { session, profile, signOut, pathname, navigate } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState(
    SIDEBAR_COLLAPSED_KEY,
    false,
  );

  const displayName = profile?.name || session.name || "Admin";
  const displayEmail =
    profile?.email || session.email || "no-email@example.com";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div
      className={`admin-shell ${sidebarCollapsed ? "collapsed" : ""}`.trim()}
    >
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-brand-block">
          <img
            src="/logo.png"
            alt="LearnCognition"
            className="admin-brand-mark"
            style={{ width: "32px", height: "32px", objectFit: "contain" }}
          />
          {!sidebarCollapsed && (
            <div className="admin-brand-text">
              <p className="admin-brand-label">LearnCognition</p>
              <p className="admin-brand-sub">Admin Panel</p>
            </div>
          )}
          <button
            type="button"
            className="icon-button admin-sidebar-toggle"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {adminNavItems.map(({ path, label, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <AppLink
                key={path}
                to={path}
                className={`admin-nav-link ${isActive ? "active" : ""}`.trim()}
              >
                <Icon size={18} className="admin-nav-icon" />
                {!sidebarCollapsed && <span>{label}</span>}
              </AppLink>
            );
          })}
        </nav>

        <div className="admin-profile-section">
          <div className="admin-profile-info">
            <div className="admin-profile-avatar">{displayName[0]}</div>
            {!sidebarCollapsed && (
              <div className="admin-profile-text">
                <p className="admin-profile-name">{displayName}</p>
                <p className="admin-profile-role">ADMIN</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="icon-button admin-signout-btn"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-header">
          <div className="admin-header-title">
            <h1>{title}</h1>
            {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="admin-header-actions">{actions}</div>}
        </div>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
