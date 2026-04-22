import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { shortDescription } from "../utils/formatting.js";

export default function ModulesListPage() {
  const { navigate, getModuleView, modules, workspaceSummary } = useApp();

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
      {modules.length ? (
        <div className="stack">
          {modules.map((module) => {
            const resolved = getModuleView(module.id);
            if (!resolved) return null;

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
      ) : (
        <Card className="empty-state">
          <h3>
            {workspaceSummary.live ? "No modules saved yet" : "Loading modules"}
          </h3>
          <p>
            {workspaceSummary.live
              ? "Create your first module in Supabase to populate this list."
              : "Waiting for module rows to load from Supabase."}
          </p>
        </Card>
      )}
    </PageShell>
  );
}
