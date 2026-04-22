import {
  ArrowRight,
  Bell,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import { AppLink } from "../components/ui/AppLink.jsx";
import { MetricStrip } from "../components/ui/MetricStrip.jsx";
import { shortDescription } from "../utils/formatting.js";

const quickActions = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    copy: "Review module performance, class trends, and live summaries.",
    to: "/dashboard",
  },
  {
    icon: Bell,
    title: "Notifications",
    copy: "Track shares, scores, and account updates in one place.",
    to: "/notifications",
  },
  {
    icon: BookOpen,
    title: "Modules list",
    copy: "Open module records, descriptions, and share codes.",
    to: "/modules",
  },
  {
    icon: Sparkles,
    title: "Settings",
    copy: "Tune your workspace, appearance, and session preferences.",
    to: "/settings",
  },
];

export default function TeacherHomePage() {
  const {
    navigate,
    notifications,
    modules,
    students,
    profile,
    session,
    workspaceSummary,
  } = useApp();
  const unreadCount = notifications.filter((item) => !item.read).length;
  const homeMetrics = [
    {
      value: `${workspaceSummary.modulesCount ?? modules.length}`,
      label: "Active modules",
    },
    {
      value: `${workspaceSummary.learnersCount ?? students.length}`,
      label: "Students enrolled",
    },
    { value: `${workspaceSummary.averageScore ?? 0}%`, label: "Average score" },
    { value: `${unreadCount}`, label: "Unread updates" },
  ];

  return (
    <PageShell
      eyebrow="Teacher home"
      title={`Welcome back, ${profile.name || session.name || "teacher"}.`}
      actions={
        <>
          <PrimaryButton onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={16} aria-hidden="true" />
            Open dashboard
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/create")}>
            <Sparkles size={16} aria-hidden="true" />
            Create module
          </SecondaryButton>
        </>
      }
    >
      <div className="content-grid home-grid">
        <Card className="hero-card home-hero">
          <div className="home-hero-copy">
            <p className="eyebrow home-eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              Classroom workspace
            </p>
            <h2>Welcome to the teacher dashboard.</h2>
            <p className="home-hero-subtitle">
              Keep track of active modules, student progress, and notifications
              from one calm overview that feels consistent with the marketing
              experience.
            </p>
            <div className="hero-actions home-hero-actions">
              <PrimaryButton onClick={() => navigate("/dashboard")}>
                Open dashboard
                <ArrowRight size={16} aria-hidden="true" />
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate("/create")}>
                Create module
                <ArrowRight size={16} aria-hidden="true" />
              </SecondaryButton>
            </div>
          </div>
        </Card>

        <div className="home-metrics">
          <MetricStrip items={homeMetrics} />
        </div>

        <Card className="home-actions-card home-wide-card">
          <div className="home-section-heading">
            <p className="eyebrow">Quick actions</p>
            <h3>Jump back to the tools you use most.</h3>
            <p>
              Open the common teacher workflows without losing the landing-page
              feel.
            </p>
          </div>

          <div className="home-action-grid">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <AppLink
                  key={item.title}
                  to={item.to}
                  className="home-action-card"
                >
                  <div className="home-action-icon">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.copy}</p>
                  </div>
                  <span className="home-action-footer">
                    Open
                    <ChevronRight size={14} aria-hidden="true" />
                  </span>
                </AppLink>
              );
            })}
          </div>
        </Card>

        <Card>
          <p className="eyebrow">Recent activity</p>
          {notifications.length ? (
            <div className="stack">
              {notifications.slice(0, 4).map((item) => (
                <div className="activity-row" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                  </div>
                  <StatusPill tone={item.read ? "neutral" : "accent"}>
                    {item.time}
                  </StatusPill>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>
                {workspaceSummary.live
                  ? "No notifications yet"
                  : "Loading notifications"}
              </h3>
              <p>
                {workspaceSummary.live
                  ? "Workspace notifications stored in Supabase will appear here."
                  : "Waiting for notification rows to sync from Supabase."}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <p className="eyebrow">Top modules</p>
          {modules.length ? (
            <div className="stack">
              {modules.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  className="list-card home-list-card"
                  onClick={() => navigate(`/modules/${module.id}`)}
                >
                  <div>
                    <div className="list-topline">
                      <strong>{module.name}</strong>
                      <StatusPill
                        tone={module.type === "identify" ? "accent" : "neutral"}
                      >
                        {module.type}
                      </StatusPill>
                    </div>
                    <p>{shortDescription(module.description, 48)}</p>
                  </div>
                  <div className="list-metrics">
                    <span>{module.stats.averageScore}% avg</span>
                    <span>{module.students.length} students</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>
                {workspaceSummary.live ? "No modules yet" : "Loading modules"}
              </h3>
              <p>
                {workspaceSummary.live
                  ? "Create modules in Supabase to fill this list."
                  : "Waiting for module rows to sync from Supabase."}
              </p>
            </div>
          )}
        </Card>

        <Card className="home-spotlight-card home-wide-card">
          <div className="home-section-heading">
            <p className="eyebrow">Student spotlight</p>
            <h3>Students ready for the next round.</h3>
            <p>
              Sample progress cues inspired by the landing page&apos;s
              testimonial blocks.
            </p>
          </div>

          {students.length ? (
            <div className="home-spotlight-grid">
              {students.slice(0, 3).map((student) => (
                <div className="home-spotlight-item" key={student.id}>
                  <div className="home-spotlight-top">
                    <div>
                      <strong>{student.name}</strong>
                      <p>{shortDescription(student.description, 54)}</p>
                    </div>
                    <StatusPill
                      tone={student.score == null ? "neutral" : "accent"}
                    >
                      {student.score == null ? "Pending" : `${student.score}%`}
                    </StatusPill>
                  </div>
                  <div className="home-spotlight-meta">
                    <span>{student.modulesTaken.length} modules taken</span>
                    <span>{student.records[0]?.module || "No module yet"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>
                {workspaceSummary.live ? "No students yet" : "Loading students"}
              </h3>
              <p>
                {workspaceSummary.live
                  ? "Add student rows to Supabase to populate this spotlight."
                  : "Waiting for student rows to sync from Supabase."}
              </p>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
