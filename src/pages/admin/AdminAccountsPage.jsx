import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";
import { Users, Shield, User } from "lucide-react";
import { supabase } from "../../services/integrations.js";

export default function AdminAccountsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceLoading && session.role === "admin") {
      fetchProfiles();
    }
  }, [workspaceLoading, session.role]);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Error fetching profiles.");
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const toggleRole = async (profile) => {
    const nextRole = profile.role === "admin" ? "teacher" : "admin";
    if (!confirm(`Are you sure you want to make ${profile.full_name} a ${nextRole}?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", profile.id);

    if (error) {
      showToast("Error updating role. You might not have permission.");
    } else {
      showToast(`Role updated to ${nextRole}.`);
      fetchProfiles();
    }
  };

  if (workspaceLoading) return null;

  if (session.role !== "admin") {
    return (
      <PageShell title="Access Denied">
        <p>You do not have permission to view this page.</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Manage Accounts"
      subtitle="View and manage user roles across the platform."
    >
      <div className="admin-list-container">
        {loading ? (
          <p>Loading accounts...</p>
        ) : (
          <div className="dashboard-grid">
            {profiles.map((profile) => (
              <Card 
                key={profile.id} 
                title={profile.full_name} 
                icon={profile.role === "admin" ? <Shield size={18} /> : <User size={18} />}
              >
                <p className="subtitle">{profile.email}</p>
                <div style={{ marginTop: "0.5rem" }}>
                  <span className={`status-pill ${profile.role === "admin" ? "active" : ""}`}>
                    {profile.role?.toUpperCase() || "TEACHER"}
                  </span>
                </div>
                <div className="card-actions" style={{ marginTop: "1rem" }}>
                  <SecondaryButton onClick={() => toggleRole(profile)} disabled={profile.id === session.userId}>
                    Change Role
                  </SecondaryButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
