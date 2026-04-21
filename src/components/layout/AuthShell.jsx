import { ArrowLeft } from "lucide-react";
import { AppLink } from "../ui/AppLink.jsx";
import { Card } from "../ui/Card.jsx";

export function AuthShell({
  title,
  subtitle,
  children,
  footerLinks = [],
  backTo = "/",
  backLabel = "",
}) {
  const showBackText = Boolean(backLabel && backLabel.trim());

  return (
    <div className="auth-shell">
      <div className="auth-shell-orb auth-shell-orb-a" />
      <div className="auth-shell-orb auth-shell-orb-b" />

      <div className="auth-shell-frame">
        <header className="auth-brand-lockup">
          <AppLink to="/" className="auth-brand">
            <span className="auth-brand-mark">LC</span>
            <span className="auth-brand-copy">
              <strong>LearnCognition</strong>
              <small>Secure access workspace</small>
            </span>
          </AppLink>
          <p className="auth-brand-tagline">Teacher and admin sign-in</p>
        </header>

        <Card className="auth-card">
          {backTo ? (
            <AppLink
              to={backTo}
              className={`auth-back-link ${showBackText ? "" : "icon-only"}`.trim()}
              aria-label={showBackText ? undefined : "Back"}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {showBackText ? <span>{backLabel}</span> : null}
            </AppLink>
          ) : null}

          <div className="auth-card-header">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <div className="auth-card-body">{children}</div>
        </Card>

        {footerLinks.length ? (
          <nav className="auth-footer-links" aria-label="Auth footer links">
            {footerLinks.map((item) => (
              <AppLink key={item.label} to={item.to}>
                {item.label}
              </AppLink>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
