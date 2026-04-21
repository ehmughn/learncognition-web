import { useApp } from "../context/AppContext.jsx";
import { GuestShell } from "../components/layout/GuestShell.jsx";
import { AppLink } from "../components/ui/AppLink.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import {
  guestHighlights,
  landingMetrics,
  chartBars,
} from "../constants/notifications.js";
import { MetricStrip } from "../components/ui/MetricStrip.jsx";

export default function GuestLandingPage() {
  const { navigate } = useApp();

  return (
    <GuestShell
      kicker="Commercial introduction"
      title="LearnCognition turns object-based learning into a polished teacher workflow."
      subtitle="Build Identify and Search modules, share them with a code, track student activity, and keep the entire journey clean enough to present to a school district or a parent demo."
      actions={
        <>
          <PrimaryButton onClick={() => navigate("/login")}>
            Login
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/register")}>
            Create teacher account
          </SecondaryButton>
        </>
      }
    >
      <div className="guest-preview-grid">
        <Card>
          <p className="eyebrow">Why teams use it</p>
          <div className="stack">
            {guestHighlights.map((item) => (
              <div className="feature-row" key={item}>
                <span className="feature-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="eyebrow">Experience</p>
          <div className="stack gap-large">
            <div className="preview-card hero-preview">
              <div>
                <p className="eyebrow">Teacher dashboard</p>
                <h3>
                  Fast overview with module performance, scans, and shares.
                </h3>
              </div>
              <div className="preview-bars">
                {chartBars.map((bar, index) => (
                  <span key={index} style={{ height: `${bar}%` }} />
                ))}
              </div>
            </div>
            <div className="preview-card slim">
              <strong>Admin safety</strong>
              <p>
                When admins log in, a verification email is required before full
                access is unlocked.
              </p>
            </div>
          </div>
        </Card>
      </div>
      <MetricStrip items={landingMetrics} />
    </GuestShell>
  );
}
