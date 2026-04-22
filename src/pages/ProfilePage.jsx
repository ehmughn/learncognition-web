import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { SecondaryButton } from "../components/ui/Button.jsx";
import { shortDescription } from "../utils/formatting.js";

export default function ProfilePage() {
  const { session, profile, navigate, modules } = useApp();
  const displayName = profile.name || session.name || "Teacher";
  const displayEmail = profile.email || session.email || "No workspace profile";
  const displaySchool = profile.school || "Not set";
  const displayStatus = profile.status || "Not set";

  return (
    <PageShell
      eyebrow="Profile"
      title="Profile"
      actions={
        <SecondaryButton onClick={() => navigate("/settings")}>
          Settings
        </SecondaryButton>
      }
    >
      <div className="content-grid profile-grid">
        <Card>
          <p className="eyebrow">Account</p>
          <h3>{displayName}</h3>
          <p>{displayEmail}</p>
          <div className="profile-metadata">
            <span>Role: {profile.role || session.role || "teacher"}</span>
            <span>School: {displaySchool}</span>
            <span>Status: {displayStatus}</span>
          </div>
        </Card>
        <Card>
          <p className="eyebrow">Recent work</p>
          {modules.length ? (
            <div className="stack">
              {modules.slice(0, 3).map((module) => (
                <div className="activity-row" key={module.id}>
                  <div>
                    <strong>{module.name}</strong>
                    <p>{shortDescription(module.description, 40)}</p>
                  </div>
                  <StatusPill tone="neutral">
                    {module.stats.averageScore}% avg
                  </StatusPill>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No modules yet</h3>
              <p>
                Workspace modules will appear here once they are saved in
                Supabase.
              </p>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
