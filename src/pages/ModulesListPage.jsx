import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { modulesSeed } from "../constants/modules.js";
import { shortDescription } from "../utils/formatting.js";

export default function ModulesListPage() {
  const { navigate, getModuleView, moduleDrafts } = useApp();

  return (
    <PageShell
      eyebrow="Modules"
      title="Modules"
      actions={
        <PrimaryButton onClick={() => navigate("/create")}>
          Create module
        </PrimaryButton>
      }
    >
      <div className="stack">
        {modulesSeed.map((module) => {
          const resolved = getModuleView(module.id, moduleDrafts);
          return (
            <button
              key={module.id}
              className="list-card"
              type="button"
              onClick={() => navigate(`/modules/${module.id}`)}
            >
              <div>
                <div className="list-topline">
                  <strong>{resolved.name}</strong>
                  <StatusPill
                    tone={resolved.type === "identify" ? "accent" : "neutral"}
                  >
                    {resolved.type}
                  </StatusPill>
                </div>
                <p>{shortDescription(resolved.description, 30)}</p>
              </div>
              <div className="list-metrics">
                <span>{resolved.stats.scanned} scans</span>
                <span>{resolved.stats.taken} taken</span>
              </div>
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}
