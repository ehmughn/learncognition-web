import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { shortDescription } from "../utils/formatting.js";
import { User, Mail, BookOpen, Award } from "lucide-react";

export default function ProfilePage() {
  const { session, profile, modules } = useApp();
  const displayName = profile.full_name || profile.name || session.name || "Teacher";
  const displayEmail = profile.email || session.email || "No email available";

  return (
    <PageShell
      eyebrow="Profile"
      title="Profile"
    >
      <div className="content-grid profile-grid">
        <Card>
          <div className="profile-header-redesign">
            <div className="profile-avatar-large">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} />
              ) : (
                <User size={48} strokeWidth={1.5} />
              )}
            </div>
            <div className="profile-info-main">
              <h3>{displayName}</h3>
              <div className="profile-detail-item">
                <Mail size={16} />
                <span>{displayEmail}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="profile-stats-cards">
          <Card>
            <div className="profile-stat-item">
              <BookOpen size={20} className="accent-icon" />
              <div>
                <strong>{modules.length}</strong>
                <span>Active Modules</span>
              </div>
            </div>
          </Card>
          <Card>
            <div className="profile-stat-item">
              <Award size={20} className="accent-icon" />
              <div>
                <strong>{modules.reduce((acc, m) => acc + (m.stats?.completedCount || 0), 0)}</strong>
                <span>Completed Tasks</span>
              </div>
            </div>
          </Card>
        </div>

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
                    {module.stats?.averageScore || 0}% avg
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

      <style>{`
        .profile-header-redesign {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 8px;
        }

        .profile-avatar-large {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--faint);
          overflow: hidden;
          border: 2px solid var(--border-soft);
        }

        .profile-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info-main h3 {
          font-size: 1.75rem;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .profile-detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 0.9375rem;
        }

        .profile-stats-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .profile-stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .profile-stat-item strong {
          display: block;
          font-size: 1.25rem;
          line-height: 1.2;
        }

        .profile-stat-item span {
          font-size: 0.8125rem;
          color: var(--faint);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .accent-icon {
          color: var(--accent);
        }

        @media (max-width: 640px) {
          .profile-header-redesign {
            flex-direction: column;
            text-align: center;
          }
          .profile-detail-item {
            justify-content: center;
          }
          .profile-stats-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PageShell>
  );
}
