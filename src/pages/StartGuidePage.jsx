import { useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import { onboardingPaths } from "../constants/notifications.js";
import { Card } from "../components/ui/Card.jsx";

export default function StartGuidePage() {
  const { navigate, startTour, cancelTour, session } = useApp();

  useEffect(() => {
    startTour();
    return () => cancelTour();
  }, [startTour, cancelTour]);

  return (
    <PageShell
      eyebrow="Welcome guide"
      title="Start here and move through the core teacher pages automatically."
      subtitle="The guided tour demonstrates the main navigation path: home, dashboard, create modules, modules list, profile, settings, and back to home."
      actions={
        <>
          <PrimaryButton onClick={() => navigate("/")}>
            Skip guide
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/dashboard")}>
            Open dashboard
          </SecondaryButton>
        </>
      }
    >
      <div className="start-layout">
        <Card>
          <p className="eyebrow">Tour</p>
          <h3>What the sequence covers</h3>
          <div className="timeline">
            {onboardingPaths.map((path, index) => (
              <div className="timeline-row" key={`${path}-${index}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>
                    {path === "/" && index === onboardingPaths.length - 1
                      ? "Return"
                      : path.replace("/", "") || "Home"}
                  </strong>
                  <p>{path}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="start-note">
          <p className="eyebrow">Session</p>
          <h3>{session.authenticated ? session.name : "Preview user"}</h3>
          <p>
            The tour is optional and can be stopped at any time. It simply
            cycles through the primary teacher pages in order.
          </p>
          <div className="stack">
            <PrimaryButton onClick={() => navigate("/")}>
              Finish and go home
            </PrimaryButton>
            <SecondaryButton onClick={() => navigate("/modules")}>
              Jump to modules
            </SecondaryButton>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
