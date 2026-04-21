import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import { AppLink } from "../components/ui/AppLink.jsx";
import { findModule } from "../utils/dataHelpers.js";

export default function TeacherHomePage() {
  const { navigate, notifications } = useApp();
  const unreadCount = notifications.filter((item) => !item.read).length;
  return (
    <PageShell
      eyebrow="Teacher home"
      title="Your learning workspace opens with a clean summary of progress, activity, and next steps."
      subtitle="This home screen gives teachers a fast entry point into module analytics, recent activity, notifications, and the rest of the product surface."
      actions={
        <>
          <PrimaryButton onClick={() => navigate("/dashboard")}>
            Open dashboard
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/create")}>
            Create module
          </SecondaryButton>
        </>
      }
    >
      <div className="content-grid home-grid">
        <Card className="hero-card">
          <div className="hero-copy">
            <StatusPill tone="accent">
              {unreadCount} unread notifications
            </StatusPill>
            <h3>Everything a teacher needs in one place.</h3>
            <p>
              Review module performance, see recent shares, and jump directly
              into common workflows from a single welcome screen.
            </p>
          </div>
          <div className="hero-tiles">
            <div>
              <strong>Modules</strong>
              <span>12 active</span>
            </div>
            <div>
              <strong>Students</strong>
              <span>48 enrolled</span>
            </div>
            <div>
              <strong>Share code</strong>
              <span>4821936507</span>
            </div>
          </div>
        </Card>
        <Card>
          <p className="eyebrow">Recent activity</p>
          <div className="stack">
            {notifications.slice(0, 3).map((item) => (
              <div className="activity-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </div>
                <StatusPill tone={item.read ? "neutral" : "accent"}>
                  {item.time}
                </StatusPill>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="eyebrow">Quick links</p>
          <div className="quick-grid">
            <AppLink to="/dashboard" className="quick-link">
              Dashboard
            </AppLink>
            <AppLink to="/modules" className="quick-link">
              Modules list
            </AppLink>
            <AppLink to="/profile" className="quick-link">
              Profile
            </AppLink>
            <AppLink to="/settings" className="quick-link">
              Settings
            </AppLink>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
