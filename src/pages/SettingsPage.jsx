import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Field } from "../components/ui/Card.jsx";
import { Select } from "../components/ui/FormInputs.jsx";

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();

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
                checked={settings.notificationsEnabled}
                onChange={(event) =>
                  updateSettings({
                    ...settings,
                    notificationsEnabled: event.target.checked,
                  })
                }
              />
            </label>
            <label className="switch-row">
              <span>Direct sharing</span>
              <input
                type="checkbox"
                checked={settings.sharingEnabled}
                onChange={(event) =>
                  updateSettings({
                    ...settings,
                    sharingEnabled: event.target.checked,
                  })
                }
              />
            </label>
            <Field label="Theme" hint="Stored in Supabase">
              <Select
                value={settings.themeMode}
                onChange={(event) =>
                  updateSettings({
                    ...settings,
                    themeMode: event.target.value,
                  })
                }
              >
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
              <span>Synced</span>
            </div>
            <div className="summary-row">
              <strong>Sync</strong>
              <span>Saved to Supabase</span>
            </div>
            <div className="summary-row">
              <strong>Version</strong>
              <span>Workspace-backed prototype</span>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
