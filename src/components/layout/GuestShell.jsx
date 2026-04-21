import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { AppLink } from "../ui/AppLink.jsx";

export function GuestShell({ kicker, title, subtitle, actions, children }) {
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
              <small>Secure access workspace</small>
            </span>
          </AppLink>
          <div className="guest-top-actions">
            <AppLink to="/login" className="text-link">
              Login
            </AppLink>
            <AppLink to="/register" className="text-link">
              Register
            </AppLink>
          </div>
        </header>

        <div className="guest-content">
          <div className="guest-copy">
            <p className="eyebrow">{kicker}</p>
            <h1>{title}</h1>
            {subtitle ? <p className="subtitle large">{subtitle}</p> : null}
            {actions ? <div className="hero-actions">{actions}</div> : null}
            <div className="guest-trust-row" aria-hidden="true">
              <div className="guest-trust-item">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>Protected sign in</span>
              </div>
              <div className="guest-trust-item">
                <BadgeCheck size={16} aria-hidden="true" />
                <span>Email verification</span>
              </div>
              <div className="guest-trust-item">
                <Sparkles size={16} aria-hidden="true" />
                <span>Clean teacher workflow</span>
              </div>
            </div>
          </div>
          <div className="guest-panel">{children}</div>
        </div>
      </div>
    </div>
  );
}
