import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../components/ui/Button.jsx";
import { Plus, Search, Edit2, Trash2, Lock, Eye, EyeOff, Users, Link as LinkIcon, X, UserCheck } from "lucide-react";
import { supabase, adminSafeSignUp } from "../../services/integrations.js";

function ViewLinkedStudentsModal({ parent, onClose }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, [parent.id]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("parent_students")
      .select("student:profiles!student_id(id, full_name, email)")
      .eq("parent_id", parent.id);
    
    if (!error && data) {
      setLinks(data.map(d => d.student));
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Children of {parent.full_name}</h2>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-list" style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", margin: "1rem 0" }}>
          {loading ? (
            <p className="muted" style={{ textAlign: "center" }}>Loading...</p>
          ) : links.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem" }}>No children linked to this parent yet.</p>
          ) : (
            links.map(student => (
              <div key={student.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)" }}>
                <div className="table-avatar" style={{ margin: 0 }}>{student.full_name?.[0]?.toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight: "600", margin: 0 }}>{student.full_name}</p>
                  <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>{student.email}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <PrimaryButton onClick={onClose} style={{ width: "100%" }}>Close</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function AssignStudentModal({ parent, onClose, showToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedStudentIds, setAssignedStudentIds] = useState(new Set());

  useEffect(() => {
    fetchAssignedStudents();
  }, [parent.id]);

  const fetchAssignedStudents = async () => {
    const { data, error } = await supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", parent.id);
    
    if (!error && data) {
      setAssignedStudentIds(new Set(data.map(d => d.student_id)));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student")
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) showToast("Error searching students");
    else setStudents(data || []);
    setLoading(false);
  };

  const toggleLink = async (studentId) => {
    const isLinked = assignedStudentIds.has(studentId);
    
    if (isLinked) {
      const { error } = await supabase
        .from("parent_students")
        .delete()
        .eq("parent_id", parent.id)
        .eq("student_id", studentId);
      
      if (error) showToast("Error unlinking student");
      else {
        const next = new Set(assignedStudentIds);
        next.delete(studentId);
        setAssignedStudentIds(next);
        showToast("Student unlinked");
      }
    } else {
      const { error } = await supabase
        .from("parent_students")
        .insert({ parent_id: parent.id, student_id: studentId });
      
      if (error) showToast("Error linking student");
      else {
        const next = new Set(assignedStudentIds);
        next.add(studentId);
        setAssignedStudentIds(next);
        showToast("Student linked successfully");
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Assign Children to {parent.full_name}</h2>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="search-box" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input 
            type="text" 
            placeholder="Search students by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
          />
          <PrimaryButton onClick={handleSearch} disabled={loading}>
            <Search size={16} />
          </PrimaryButton>
        </div>

        <div className="modal-list" style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {students.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "1rem" }}>Search for students to link them to this parent.</p>
          ) : (
            students.map(student => (
              <div key={student.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)" }}>
                <div>
                  <p style={{ fontWeight: "600", margin: 0 }}>{student.full_name}</p>
                  <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>{student.email}</p>
                </div>
                <SecondaryButton 
                  onClick={() => toggleLink(student.id)}
                  style={{ 
                    minWidth: "40px",
                    backgroundColor: assignedStudentIds.has(student.id) ? "var(--accent-soft)" : "transparent",
                    borderColor: assignedStudentIds.has(student.id) ? "var(--accent)" : "var(--border)"
                  }}
                >
                  {assignedStudentIds.has(student.id) ? <UserCheck size={16} color="var(--accent)" /> : <LinkIcon size={16} />}
                </SecondaryButton>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: "1.5rem" }}>
          <PrimaryButton onClick={onClose} style={{ width: "100%" }}>Done</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminParentsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewLinksModal, setShowViewLinksModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!workspaceLoading && session.role === "admin") {
      fetchParents();
    }
  }, [workspaceLoading, session.role]);

  const fetchParents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "parent")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Error fetching parents.");
    } else {
      setParents(data || []);
    }
    setLoading(false);
  };

  const filteredParents = parents.filter(
    (parent) =>
      parent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateParent = async (e) => {
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
        role: "parent"
      });

      if (error) throw error;

      showToast("Parent account created successfully!");
      setShowCreateModal(false);
      setFormData({ email: "", password: "", full_name: "" });
      fetchParents();
    } catch (error) {
      showToast(`Error creating account: ${error.message}`);
    }
  };

  const handleUpdateParent = async (e) => {
    e.preventDefault();
    if (!selectedParent) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          email: formData.email,
        })
        .eq("id", selectedParent.id);

      if (error) throw error;

      showToast("Parent account updated successfully!");
      setShowEditModal(false);
      fetchParents();
    } catch (error) {
      showToast(`Error updating account: ${error.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedParent || !newPassword) {
      showToast("Password is required");
      return;
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedParent.id,
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

  const handleDeleteParent = async (parent) => {
    if (!confirm(`Are you sure you want to delete ${parent.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", parent.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(
        parent.id,
      );
      if (authError) throw authError;

      showToast("Parent deleted successfully!");
      fetchParents();
    } catch (error) {
      showToast(`Error deleting parent: ${error.message}`);
    }
  };

  const openEditModal = (parent) => {
    setSelectedParent(parent);
    setFormData({
      email: parent.email,
      full_name: parent.full_name,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (parent) => {
    setSelectedParent(parent);
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
      title="Manage Parents"
      subtitle={`${filteredParents.length} parent${filteredParents.length !== 1 ? "s" : ""} in the system`}
      actions={
        <PrimaryButton onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Parent
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
        <p>Loading parents...</p>
      ) : filteredParents.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No parents found</h3>
          <p>Try adjusting your search or create a new parent account</p>
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
              {filteredParents.map((parent) => (
                <tr key={parent.id}>
                  <td>
                    <div className="table-avatar">
                      {parent.full_name?.[0]?.toUpperCase()}
                    </div>
                    {parent.full_name}
                  </td>
                  <td>{parent.email}</td>
                  <td>{new Date(parent.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <SecondaryButton 
                        onClick={() => { setSelectedParent(parent); setShowViewLinksModal(true); }}
                        className="action-btn-small" 
                        title="View Linked Children"
                      >
                        <Eye size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => { setSelectedParent(parent); setShowAssignModal(true); }}
                        className="action-btn-small" 
                        title="Assign Children"
                      >
                        <LinkIcon size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => openEditModal(parent)}
                        className="action-btn-small" 
                        title="Edit Parent"
                      >
                        <Edit2 size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => openPasswordModal(parent)}
                        className="action-btn-small" 
                        title="Change Password"
                      >
                        <Lock size={14} />
                      </SecondaryButton>
                      <DangerButton
                        onClick={() => handleDeleteParent(parent)}
                        className="action-btn-small"
                        title="Delete Parent"
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
            <h2>Create New Parent</h2>
            <form onSubmit={handleCreateParent} className="modal-form">
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
                <PrimaryButton type="submit">Create Parent</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedParent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Parent</h2>
            <form onSubmit={handleUpdateParent} className="modal-form">
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
      {showPasswordModal && selectedParent && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <p className="modal-subtitle">Change password for {selectedParent.full_name}</p>
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

      {/* Assign Modal */}
      {showAssignModal && selectedParent && (
        <AssignStudentModal 
          parent={selectedParent} 
          onClose={() => setShowAssignModal(false)}
          showToast={showToast}
        />
      )}

      {/* View Links Modal */}
      {showViewLinksModal && selectedParent && (
        <ViewLinkedStudentsModal 
          parent={selectedParent} 
          onClose={() => setShowViewLinksModal(false)}
        />
      )}
    </AdminLayout>
  );
}
