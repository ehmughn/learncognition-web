import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Field } from "../components/ui/Card.jsx";
import { Select } from "../components/ui/FormInputs.jsx";

export default function SettingsPage() {
  const { navigate } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "light";
    }
    return "light";
  });

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setThemeMode(newTheme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("app-theme", newTheme);
    }
  };

  return (
    <PageShell eyebrow="Settings" title="Settings">
      <div className="content-grid settings-grid">
        <Card>
          <p className="eyebrow">Preferences</p>
          <div className="settings-list">
            <label className="switch-row">
              <span>Notifications</span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(event) =>
                  setNotificationsEnabled(event.target.checked)
                }
              />
            </label>
            <label className="switch-row">
              <span>Direct sharing</span>
              <input
                type="checkbox"
                checked={sharingEnabled}
                onChange={(event) => setSharingEnabled(event.target.checked)}
              />
            </label>
            <Field label="Theme" hint="Static prototype choice">
              <Select value={themeMode} onChange={handleThemeChange}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>
          </div>
        </Card>
        <Card>
          <p className="eyebrow">System summary</p>
          <div className="stack">
            <div className="summary-row">
              <strong>App status</strong>
              <span>Healthy</span>
            </div>
            <div className="summary-row">
              <strong>Sync</strong>
              <span>Auto-save enabled</span>
            </div>
            <div className="summary-row">
              <strong>Version</strong>
              <span>Static prototype</span>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
