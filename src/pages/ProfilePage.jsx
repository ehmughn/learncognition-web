import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { SecondaryButton } from "../components/ui/Button.jsx";
import { modulesSeed } from "../constants/modules.js";
import { shortDescription } from "../utils/formatting.js";

export default function ProfilePage() {
  const { session, navigate } = useApp();

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
          <h3>{session.name || "Ari Santos"}</h3>
          <p>{session.email || "teacher@learncognition.com"}</p>
          <div className="profile-metadata">
            <span>Role: {session.role || "teacher"}</span>
            <span>School: Sunrise Learning Center</span>
            <span>Status: Verified</span>
          </div>
        </Card>
        <Card>
          <p className="eyebrow">Recent work</p>
          <div className="stack">
            {modulesSeed.slice(0, 3).map((module) => (
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
        </Card>
      </div>
    </PageShell>
  );
}
