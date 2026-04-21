import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";

export default function ModuleDetailPage({ moduleId }) {
  const { navigate, getModuleView, moduleDrafts } = useApp();
  const module = getModuleView(moduleId, moduleDrafts);

  return (
    <PageShell
      eyebrow={`Module / ${module.id}`}
      title={module.name}
      actions={
        <>
          <PrimaryButton
            onClick={() => navigate(`/modules/${module.id}/share`)}
          >
            Share module
          </PrimaryButton>
          <SecondaryButton
            onClick={() => navigate(`/modules/${module.id}/edit`)}
          >
            Edit module
          </SecondaryButton>
        </>
      }
    >
      <div className="content-grid module-detail-grid">
        <div className="stat-grid four-up">
          <Card className="stat-card">
            <p>Items</p>
            <strong>{module.stats.items}</strong>
          </Card>
          <Card className="stat-card">
            <p>Students scanned</p>
            <strong>{module.stats.scanned}</strong>
          </Card>
          <Card className="stat-card">
            <p>Students taken</p>
            <strong>{module.stats.taken}</strong>
          </Card>
          <Card className="stat-card">
            <p>Average score</p>
            <strong>{module.stats.averageScore}%</strong>
          </Card>
        </div>
        <div className="content-grid two-column">
          <Card>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Module dashboard</p>
                <h3>Tracking summary</h3>
              </div>
              <StatusPill tone="accent">{module.type}</StatusPill>
            </div>
            <div className="mini-kpi-grid">
              <div>
                <strong>{module.stats.passingRate}%</strong>
                <span>Passing rate</span>
              </div>
              <div>
                <strong>{module.code}</strong>
                <span>Share code</span>
              </div>
              <div>
                <strong>{module.students.length}</strong>
                <span>Joined students</span>
              </div>
            </div>
          </Card>
          <Card>
            <p className="eyebrow">Shortcuts</p>
            <div className="stack">
              <SecondaryButton
                onClick={() => navigate(`/modules/${module.id}/students`)}
              >
                View students
              </SecondaryButton>
              <SecondaryButton
                onClick={() => navigate(`/modules/${module.id}/share`)}
              >
                Open share page
              </SecondaryButton>
              <SecondaryButton
                onClick={() => navigate(`/modules/${module.id}/edit`)}
              >
                Open editor
              </SecondaryButton>
            </div>
          </Card>
        </div>
        <Card>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Module item overview</p>
              <h3>{module.items.length} configured items</h3>
            </div>
          </div>
          <div className="stack">
            {module.items.map((item, index) => (
              <div className="item-row" key={item.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
