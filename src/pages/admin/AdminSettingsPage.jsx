import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [settings, setSettings] = useState({
    platformName: "LearnCognition",
    maxUsersPerTeacher: 50,
    modulesPerPage: 20,
    enableNotifications: true,
    maintenanceMode: false,
    autoBackup: true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  if (workspaceLoading) return null;

  if (session.role !== "admin") {
    return (
      <AdminLayout title="Access Denied">
        <p>You do not have permission to view this page.</p>
      </AdminLayout>
    );
  }

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      // In a real app, you'd save these to a settings table
      showToast("Settings saved successfully!");
      setHasChanges(false);
    } catch (error) {
      showToast("Error saving settings");
    }
  };

  return (
    <AdminLayout
      title="Admin Settings"
      subtitle="Configure platform-wide settings and preferences"
    >
      <div className="admin-settings-container">
        {/* General Settings */}
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Platform Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) =>
                  handleSettingChange("platformName", e.target.value)
                }
              />
            </div>
            <div className="setting-item">
              <label>Max Users per Teacher</label>
              <input
                type="number"
                value={settings.maxUsersPerTeacher}
                onChange={(e) =>
                  handleSettingChange(
                    "maxUsersPerTeacher",
                    Number(e.target.value),
                  )
                }
              />
            </div>
            <div className="setting-item">
              <label>Modules per Page</label>
              <input
                type="number"
                value={settings.modulesPerPage}
                onChange={(e) =>
                  handleSettingChange("modulesPerPage", Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="settings-section">
          <h3>Features</h3>
          <div className="settings-toggles">
            <div className="toggle-item">
              <label>Enable Notifications</label>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) =>
                  handleSettingChange("enableNotifications", e.target.checked)
                }
              />
            </div>
            <div className="toggle-item">
              <label>Maintenance Mode</label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  handleSettingChange("maintenanceMode", e.target.checked)
                }
              />
            </div>
            <div className="toggle-item">
              <label>Auto Backup</label>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) =>
                  handleSettingChange("autoBackup", e.target.checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h3>Danger Zone</h3>
          <p>These actions cannot be undone. Please be careful.</p>
          <div className="danger-actions">
            <SecondaryButton>Clear Cache</SecondaryButton>
            <SecondaryButton>Reset System</SecondaryButton>
            <SecondaryButton>Export Database</SecondaryButton>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-footer">
          <PrimaryButton onClick={handleSaveSettings} disabled={!hasChanges}>
            <Save size={16} /> Save Settings
          </PrimaryButton>
          {hasChanges && (
            <p className="unsaved-warning">You have unsaved changes</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
