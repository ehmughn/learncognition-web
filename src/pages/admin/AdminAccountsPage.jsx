import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../components/ui/Button.jsx";
import { Plus, Search, Edit2, Trash2, Lock, Eye, EyeOff } from "lucide-react";
import { supabase, adminSafeSignUp } from "../../services/integrations.js";

export default function AdminAccountsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "teacher",
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || profile.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name) {
      showToast("All fields are required");
      return;
    }

    try {
      const { data, error } = await adminSafeSignUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role
      });

      if (error) throw error;

      showToast("Account created successfully!");
      setShowCreateModal(false);
      setFormData({ email: "", password: "", full_name: "", role: "teacher" });
      fetchProfiles();
    } catch (error) {
      showToast(`Error creating account: ${error.message}`);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!selectedProfile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
        })
        .eq("id", selectedProfile.id);

      if (error) throw error;

      showToast("Account updated successfully!");
      setShowEditModal(false);
      setFormData({ email: "", password: "", full_name: "", role: "teacher" });
      fetchProfiles();
    } catch (error) {
      showToast(`Error updating account: ${error.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedProfile || !newPassword) {
      showToast("Password is required");
      return;
    }

    try {
      // Use admin API to change password
      const { error } = await supabase.auth.admin.updateUserById(
        selectedProfile.id,
        { password: newPassword },
      );

      if (error) throw error;

      showToast("Password changed successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (error) {
      showToast(`Error changing password: ${error.message}`);
    }
  };

  const handleDeleteAccount = async (profile) => {
    if (
      !confirm(
        `Are you sure you want to delete ${profile.full_name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    if (profile.id === session.userId) {
      showToast("You cannot delete your own account");
      return;
    }

    try {
      // Delete profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(
        profile.id,
      );
      if (authError) throw authError;

      showToast("Account deleted successfully!");
      fetchProfiles();
    } catch (error) {
      showToast(`Error deleting account: ${error.message}`);
    }
  };

  const openEditModal = (profile) => {
    setSelectedProfile(profile);
    setFormData({
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      password: "",
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (profile) => {
    setSelectedProfile(profile);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  if (loading && profiles.length === 0) {
    return (
      <AdminLayout title="Manage Accounts">
        <p>Loading accounts...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Accounts"
      subtitle="Create, edit, and manage user accounts and roles across the platform."
      actions={
        <PrimaryButton onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Account
        </PrimaryButton>
      }
    >
      {/* Search & Filter */}
      <div className="admin-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teachers</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <p>Loading accounts...</p>
      ) : filteredProfiles.length === 0 ? (
        <div className="empty-state">
          <p>No accounts found. Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="admin-accounts-grid">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="admin-account-card">
              <div className="account-header">
                <div className="account-avatar">
                  {profile.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="account-info">
                  <h3>{profile.full_name}</h3>
                  <p className="account-email">{profile.email}</p>
                </div>
              </div>

              <div className="account-role">
                <span className={`role-badge ${profile.role}`}>
                  {profile.role?.toUpperCase()}
                </span>
              </div>

              <div className="account-actions">
                <SecondaryButton
                  onClick={() => openEditModal(profile)}
                  className="action-btn"
                >
                  <Edit2 size={16} /> Edit
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => openPasswordModal(profile)}
                  className="action-btn"
                  disabled={profile.id === session.userId}
                >
                  <Lock size={16} /> Password
                </SecondaryButton>
                <DangerButton
                  onClick={() => handleDeleteAccount(profile)}
                  className="action-btn"
                  disabled={profile.id === session.userId}
                >
                  <Trash2 size={16} /> Delete
                </DangerButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Account</h2>
            <form onSubmit={handleCreateAccount} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <SecondaryButton onClick={() => setShowCreateModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">Create Account</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Account</h2>
            <form onSubmit={handleUpdateAccount} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled
                  style={{ backgroundColor: "var(--bg-secondary)", cursor: "not-allowed" }}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <SecondaryButton onClick={() => setShowEditModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">Save Changes</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedProfile && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <p className="modal-subtitle">
              Change password for {selectedProfile.full_name}
            </p>
            <form onSubmit={handleChangePassword} className="modal-form">
              <div className="form-group">
                <label>New Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <SecondaryButton onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">Change Password</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
