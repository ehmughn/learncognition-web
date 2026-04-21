import {
  BookOpen,
  Gauge,
  PencilLine,
  ScanSearch,
  Share2,
  Table2,
  Users,
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";

export default function ModuleDetailPage({ moduleId }) {
  const { navigate, getModuleView, moduleDrafts } = useApp();
  const module = getModuleView(moduleId, moduleDrafts);
  const progressRows = [
    {
      label: "Scanned",
      value: module.stats.scanned,
      percent: Math.min(module.stats.scanned, 100),
    },
    {
      label: "Taken",
      value: module.stats.taken,
      percent: Math.min(module.stats.taken, 100),
    },
    {
      label: "Passing rate",
      value: `${module.stats.passingRate}%`,
      percent: module.stats.passingRate,
    },
  ];

  return (
    <PageShell
      eyebrow={`Module / ${module.id}`}
      title={module.name}
      actions={
        <>
          <PrimaryButton
            onClick={() => navigate(`/modules/${module.id}/share`)}
          >
            <Share2 size={16} aria-hidden="true" />
            Share module
          </PrimaryButton>
          <SecondaryButton
            onClick={() => navigate(`/modules/${module.id}/edit`)}
          >
            <PencilLine size={16} aria-hidden="true" />
            Edit module
          </SecondaryButton>
        </>
      }
    >
      <div className="content-grid module-detail-grid">
        <Card className="module-dashboard-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Module dashboard</p>
              <h3>Live performance overview</h3>
            </div>
            <StatusPill tone="accent">{module.type}</StatusPill>
          </div>

          <div className="module-dashboard-layout">
            <div
              className="module-score-ring"
              style={{ "--ring-score": `${module.stats.averageScore}%` }}
            >
              <div className="module-score-ring-content">
                <strong>{module.stats.averageScore}%</strong>
                <span>Average score</span>
              </div>
            </div>

            <div className="module-progress-list">
              {progressRows.map((row) => (
                <div className="module-progress-item" key={row.label}>
                  <div className="module-progress-labels">
                    <strong>{row.label}</strong>
                    <span>{row.value}</span>
                  </div>
                  <div className="module-progress-track">
                    <span style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="content-grid two-column">
          <Card className="module-summary-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Summary</p>
                <h3>Key module metrics</h3>
              </div>
            </div>
            <div className="module-summary-grid">
              <div>
                <BookOpen size={16} aria-hidden="true" />
                <strong>{module.stats.items}</strong>
                <span>Items</span>
              </div>
              <div>
                <ScanSearch size={16} aria-hidden="true" />
                <strong>{module.stats.scanned}</strong>
                <span>Scanned</span>
              </div>
              <div>
                <Users size={16} aria-hidden="true" />
                <strong>{module.stats.taken}</strong>
                <span>Taken</span>
              </div>
              <div>
                <Gauge size={16} aria-hidden="true" />
                <strong>{module.stats.passingRate}%</strong>
                <span>Passing rate</span>
              </div>
            </div>
          </Card>

          <Card className="module-summary-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Shortcuts</p>
                <h3>Fast actions</h3>
              </div>
            </div>
            <div className="stack">
              <SecondaryButton
                onClick={() => navigate(`/modules/${module.id}/students`)}
              >
                <Users size={16} aria-hidden="true" />
                View students
              </SecondaryButton>
              <SecondaryButton
                onClick={() => navigate(`/modules/${module.id}/share`)}
              >
                <Share2 size={16} aria-hidden="true" />
                Open share page
              </SecondaryButton>
              <SecondaryButton
                onClick={() => navigate(`/modules/${module.id}/edit`)}
              >
                <PencilLine size={16} aria-hidden="true" />
                Open editor
              </SecondaryButton>
            </div>
          </Card>
        </div>

        <Card className="dashboard-table-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Module item overview</p>
              <h3>{module.items.length} configured items</h3>
            </div>
            <StatusPill tone="neutral">
              <Table2 size={14} aria-hidden="true" />
              Table view
            </StatusPill>
          </div>

          <div className="table-wrap">
            <table className="module-item-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {module.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{item.label}</strong>
                    </td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
