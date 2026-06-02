import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../components/ui/Button.jsx";
import { Plus, Search, Edit2, Trash2, Lock, Eye, EyeOff, Users } from "lucide-react";
import { supabase, adminSafeSignUp } from "../../services/integrations.js";

export default function AdminTeachersPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!workspaceLoading && session.role === "admin") {
      fetchTeachers();
    }
  }, [workspaceLoading, session.role]);

  const fetchTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "teacher")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Error fetching teachers.");
    } else {
      setTeachers(data || []);
    }
    setLoading(false);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateTeacher = async (e) => {
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
        role: "teacher"
      });

      if (error) throw error;

      showToast("Teacher account created successfully!");
      setShowCreateModal(false);
      setFormData({ email: "", password: "", full_name: "" });
      fetchTeachers();
    } catch (error) {
      showToast(`Error creating account: ${error.message}`);
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          email: formData.email,
        })
        .eq("id", selectedTeacher.id);

      if (error) throw error;

      showToast("Teacher account updated successfully!");
      setShowEditModal(false);
      fetchTeachers();
    } catch (error) {
      showToast(`Error updating account: ${error.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !newPassword) {
      showToast("Password is required");
      return;
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedTeacher.id,
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

  const handleDeleteTeacher = async (teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", teacher.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(
        teacher.id,
      );
      if (authError) throw authError;

      showToast("Teacher deleted successfully!");
      fetchTeachers();
    } catch (error) {
      showToast(`Error deleting teacher: ${error.message}`);
    }
  };
const openEditModal = (teacher) => {
  setSelectedTeacher(teacher);
  setFormData({
    email: teacher.email,
    full_name: teacher.full_name,
  });
  setShowEditModal(true);
};

  const openPasswordModal = (teacher) => {
    setSelectedTeacher(teacher);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  if (workspaceLoading) return null;

  if (session.role !== "admin") {
    return (
      <AdminLayout title="Access Denied">
        <p>You do not have permission to view this page.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Teachers"
      subtitle={`${filteredTeachers.length} teacher${filteredTeachers.length !== 1 ? "s" : ""} in the system`}
      actions={
        <PrimaryButton onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Teacher
        </PrimaryButton>
      }
    >
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
      </div>

      {loading ? (
        <p>Loading teachers...</p>
      ) : filteredTeachers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No teachers found</h3>
          <p>Try adjusting your search or create a new teacher account</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="table-avatar">
                      {teacher.full_name?.[0]?.toUpperCase()}
                    </div>
                    {teacher.full_name}
                  </td>
                  <td>{teacher.email}</td>
                  <td>{new Date(teacher.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <SecondaryButton 
                        onClick={() => openEditModal(teacher)}
                        className="action-btn-small" 
                        title="Edit Teacher"
                      >
                        <Edit2 size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => openPasswordModal(teacher)}
                        className="action-btn-small" 
                        title="Change Password"
                      >
                        <Lock size={14} />
                      </SecondaryButton>
                      <DangerButton
                        onClick={() => handleDeleteTeacher(teacher)}
                        className="action-btn-small"
                        title="Delete Teacher"
                      >
                        <Trash2 size={14} />
                      </DangerButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Teacher</h2>
            <form onSubmit={handleCreateTeacher} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="modal-footer">
                <SecondaryButton onClick={() => setShowCreateModal(false)}>Cancel</SecondaryButton>
                <PrimaryButton type="submit">Create Teacher</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Teacher</h2>
            <form onSubmit={handleUpdateTeacher} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled
                  style={{ backgroundColor: "var(--bg-secondary)", cursor: "not-allowed" }}
                />
              </div>
              <div className="modal-footer">
                <SecondaryButton onClick={() => setShowEditModal(false)}>Cancel</SecondaryButton>
                <PrimaryButton type="submit">Save Changes</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <p className="modal-subtitle">Change password for {selectedTeacher.full_name}</p>
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
                <SecondaryButton onClick={() => setShowPasswordModal(false)}>Cancel</SecondaryButton>
                <PrimaryButton type="submit">Change Password</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
