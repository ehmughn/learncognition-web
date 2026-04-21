import { useApp } from "../../context/AppContext.jsx";
import { AppLink } from "../ui/AppLink.jsx";
import { SecondaryButton, PrimaryButton } from "../ui/Button.jsx";

export function GuestShell({ kicker, title, subtitle, actions, children }) {
  const { navigate } = useApp();
  return (
    <div className="guest-shell">
      <div className="guest-backdrop backdrop-a" />
      <div className="guest-backdrop backdrop-b" />
      <div className="guest-frame">
        <header className="guest-topbar">
          <AppLink to="/" className="guest-brand">
            <span className="guest-brand-mark">LC</span>
            <span>
              <strong>LearnCognition</strong>
              <small>Static prototype</small>
            </span>
          </AppLink>
          <div className="guest-top-actions">
            <AppLink to="/login" className="text-link">
              Login
            </AppLink>
            <AppLink to="/register" className="text-link">
              Register
            </AppLink>
            <SecondaryButton onClick={() => navigate("/start")}>
              Open start guide
            </SecondaryButton>
          </div>
        </header>

        <div className="guest-content">
          <div className="guest-copy">
            <p className="eyebrow">{kicker}</p>
            <h1>{title}</h1>
            {subtitle ? <p className="subtitle large">{subtitle}</p> : null}
            {actions ? <div className="hero-actions">{actions}</div> : null}
          </div>
          <div className="guest-panel">{children}</div>
        </div>
      </div>
    </div>
  );
}
