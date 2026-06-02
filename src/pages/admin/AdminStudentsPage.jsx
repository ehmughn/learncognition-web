import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../components/ui/Button.jsx";
import { Plus, Search, Edit2, Trash2, Lock, Eye, EyeOff, BookOpen, Link as LinkIcon, X, UserCheck } from "lucide-react";
import { supabase, adminSafeSignUp } from "../../services/integrations.js";

function ViewLinkedParentsModal({ student, onClose }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, [student.id]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("parent_students")
      .select("parent:profiles!parent_id(id, full_name, email)")
      .eq("student_id", student.id);
    
    if (!error && data) {
      setLinks(data.map(d => d.parent));
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Parents of {student.full_name}</h2>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-list" style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", margin: "1rem 0" }}>
          {loading ? (
            <p className="muted" style={{ textAlign: "center" }}>Loading...</p>
          ) : links.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "2rem" }}>No parents linked to this student yet.</p>
          ) : (
            links.map(parent => (
              <div key={parent.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)" }}>
                <div className="table-avatar" style={{ margin: 0 }}>{parent.full_name?.[0]?.toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight: "600", margin: 0 }}>{parent.full_name}</p>
                  <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>{parent.email}</p>
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

function AssignParentModal({ student, onClose, showToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedParentIds, setAssignedParentIds] = useState(new Set());

  useEffect(() => {
    fetchAssignedParents();
  }, [student.id]);

  const fetchAssignedParents = async () => {
    const { data, error } = await supabase
      .from("parent_students")
      .select("parent_id")
      .eq("student_id", student.id);
    
    if (!error && data) {
      setAssignedParentIds(new Set(data.map(d => d.parent_id)));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "parent")
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) showToast("Error searching parents");
    else setParents(data || []);
    setLoading(false);
  };

  const toggleLink = async (parentId) => {
    const isLinked = assignedParentIds.has(parentId);
    
    if (isLinked) {
      const { error } = await supabase
        .from("parent_students")
        .delete()
        .eq("parent_id", parentId)
        .eq("student_id", student.id);
      
      if (error) showToast("Error unlinking parent");
      else {
        const next = new Set(assignedParentIds);
        next.delete(parentId);
        setAssignedParentIds(next);
        showToast("Parent unlinked");
      }
    } else {
      const { error } = await supabase
        .from("parent_students")
        .insert({ parent_id: parentId, student_id: student.id });
      
      if (error) showToast("Error linking parent");
      else {
        const next = new Set(assignedParentIds);
        next.add(parentId);
        setAssignedParentIds(next);
        showToast("Parent linked successfully");
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Assign Parents to {student.full_name}</h2>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="search-box" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input 
            type="text" 
            placeholder="Search parents by name or email..." 
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
          {parents.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "1rem" }}>Search for parents to link them to this student.</p>
          ) : (
            parents.map(parent => (
              <div key={parent.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)" }}>
                <div>
                  <p style={{ fontWeight: "600", margin: 0 }}>{parent.full_name}</p>
                  <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>{parent.email}</p>
                </div>
                <SecondaryButton 
                  onClick={() => toggleLink(parent.id)}
                  style={{ 
                    minWidth: "40px",
                    backgroundColor: assignedParentIds.has(parent.id) ? "var(--accent-soft)" : "transparent",
                    borderColor: assignedParentIds.has(parent.id) ? "var(--accent)" : "var(--border)"
                  }}
                >
                  {assignedParentIds.has(parent.id) ? <UserCheck size={16} color="var(--accent)" /> : <LinkIcon size={16} />}
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

export default function AdminStudentsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewLinksModal, setShowViewLinksModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!workspaceLoading && session.role === "admin") {
      fetchStudents();
    }
  }, [workspaceLoading, session.role]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Error fetching students.");
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateStudent = async (e) => {
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
        role: "student"
      });

      if (error) throw error;

      showToast("Student account created successfully!");
      setShowCreateModal(false);
      setFormData({ email: "", password: "", full_name: "" });
      fetchStudents();
    } catch (error) {
      showToast(`Error creating account: ${error.message}`);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          email: formData.email,
        })
        .eq("id", selectedStudent.id);

      if (error) throw error;

      showToast("Student account updated successfully!");
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      showToast(`Error updating account: ${error.message}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !newPassword) {
      showToast("Password is required");
      return;
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedStudent.id,
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

  const handleDeleteStudent = async (student) => {
    if (!confirm(`Are you sure you want to delete ${student.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", student.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(
        student.id,
      );
      if (authError) throw authError;

      showToast("Student deleted successfully!");
      fetchStudents();
    } catch (error) {
      showToast(`Error deleting student: ${error.message}`);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      email: student.email,
      full_name: student.full_name,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (student) => {
    setSelectedStudent(student);
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
      title="Manage Students"
      subtitle={`${filteredStudents.length} student${filteredStudents.length !== 1 ? "s" : ""} in the system`}
      actions={
        <PrimaryButton onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Student
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
        <p>Loading students...</p>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No students found</h3>
          <p>Try adjusting your search or create a new student account</p>
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
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="table-avatar">
                      {student.full_name?.[0]?.toUpperCase()}
                    </div>
                    {student.full_name}
                  </td>
                  <td>{student.email}</td>
                  <td>{new Date(student.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <SecondaryButton 
                        onClick={() => { setSelectedStudent(student); setShowViewLinksModal(true); }}
                        className="action-btn-small" 
                        title="View Linked Parents"
                      >
                        <Eye size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => { setSelectedStudent(student); setShowAssignModal(true); }}
                        className="action-btn-small" 
                        title="Assign Parents"
                      >
                        <LinkIcon size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => openEditModal(student)}
                        className="action-btn-small" 
                        title="Edit Student"
                      >
                        <Edit2 size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => openPasswordModal(student)}
                        className="action-btn-small" 
                        title="Change Password"
                      >
                        <Lock size={14} />
                      </SecondaryButton>
                      <DangerButton
                        onClick={() => handleDeleteStudent(student)}
                        className="action-btn-small"
                        title="Delete Student"
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
            <h2>Create New Student</h2>
            <form onSubmit={handleCreateStudent} className="modal-form">
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
                <PrimaryButton type="submit">Create Student</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Student</h2>
            <form onSubmit={handleUpdateStudent} className="modal-form">
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
      {showPasswordModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <p className="modal-subtitle">Change password for {selectedStudent.full_name}</p>
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
      {showAssignModal && selectedStudent && (
        <AssignParentModal 
          student={selectedStudent} 
          onClose={() => setShowAssignModal(false)}
          showToast={showToast}
        />
      )}

      {/* View Links Modal */}
      {showViewLinksModal && selectedStudent && (
        <ViewLinkedParentsModal 
          student={selectedStudent} 
          onClose={() => setShowViewLinksModal(false)}
        />
      )}
    </AdminLayout>
  );
}
