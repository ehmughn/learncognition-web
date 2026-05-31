import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Users, FolderKanban, Package } from "lucide-react";

export default function AdminDashboardPage() {
  const { session, workspaceLoading } = useApp();

  if (workspaceLoading) {
    return null;
  }

  if (session.role !== "admin") {
    return (
      <PageShell title="Access Denied">
        <p>You do not have permission to view this page.</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Admin Dashboard"
      subtitle="Overview of the LearnCognition system."
    >
      <div className="dashboard-grid">
        <Card title="Teachers & Students" icon={<Users size={20} />}>
          <div className="metric-strip">
            <div className="metric">
              <span className="metric-value">--</span>
              <span className="metric-label">Total Accounts</span>
            </div>
          </div>
          <p className="card-description">Manage all user accounts and roles.</p>
        </Card>

        <Card title="Shared Library" icon={<Package size={20} />}>
          <div className="metric-strip">
            <div className="metric">
              <span className="metric-value">--</span>
              <span className="metric-label">Global Items</span>
            </div>
          </div>
          <p className="card-description">CRUD items for teachers to import.</p>
        </Card>

        <Card title="System Modules" icon={<FolderKanban size={20} />}>
          <div className="metric-strip">
            <div className="metric">
              <span className="metric-value">--</span>
              <span className="metric-label">Total Modules</span>
            </div>
          </div>
          <p className="card-description">Monitor all learning modules across the platform.</p>
        </Card>
      </div>
    </PageShell>
  );
}
