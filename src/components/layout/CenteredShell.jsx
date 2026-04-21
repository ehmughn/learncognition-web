import { useApp } from "../../context/AppContext.jsx";

export function CenteredShell({ title, children }) {
  const { session } = useApp();

  return (
    <div className="centered-shell">
      <main className="centered-main">
        <div className="centered-container">
          <div className="centered-header">
            <h1>{title}</h1>
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
