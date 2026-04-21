import { ArrowLeft } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { SecondaryButton } from "../ui/Button.jsx";

export function CenteredShell({
  title,
  children,
  backTo = "/modules",
  backLabel = "Back to modules",
}) {
  const { navigate, session } = useApp();

  return (
    <div className="centered-shell">
      <main className="centered-main">
        <div className="centered-container">
          <div className="centered-toolbar">
            <div className="centered-toolbar-start">
              {backTo ? (
                <SecondaryButton
                  className="centered-back"
                  onClick={() => navigate(backTo)}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  {backLabel}
                </SecondaryButton>
              ) : null}
            </div>
            <div className="centered-header">
              <h1>{title}</h1>
            </div>
            <div className="centered-toolbar-end" />
          </div>

          {!session.authenticated ? (
            <div className="preview-banner">
              You are viewing a static prototype. Sign in to simulate
              account-specific flows and save edits.
            </div>
          ) : null}

          <section className="centered-body">{children}</section>
        </div>
      </main>
    </div>
  );
}
