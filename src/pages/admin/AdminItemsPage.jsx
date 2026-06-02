import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "../../components/ui/Button.jsx";
import { Plus, Search, Edit2, Trash2, Package, Save, Eye, X } from "lucide-react";
import { supabase } from "../../services/integrations.js";
import "@google/model-viewer";

function ModelPreviewModal({ item, onClose }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    
    viewer.src = item.model_url;
    viewer.alt = item.display_name;
    viewer.cameraControls = true;
    viewer.autoRotate = true;
    viewer.interactionPrompt = "none";
    viewer.shadowIntensity = 1;
    viewer.toneMapping = "aces";
    viewer.exposure = 1;
    viewer.disableZoom = false;
  }, [item]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content model-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ justifyContent: "flex-end", paddingBottom: "0", borderBottom: "none", marginBottom: "0" }}>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="model-viewer-container" style={{ height: "450px", width: "100%", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", overflow: "hidden", marginTop: "0.5rem" }}>
          <model-viewer 
            ref={viewerRef} 
            className="model-viewer" 
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminItemsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    display_name: "",
    category: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!workspaceLoading && session.role === "admin") {
      fetchItems();
    }
  }, [workspaceLoading, session.role]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shared_activity_objects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Error fetching items.");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.elements.model_file.files[0];
    
    setUploading(true);
    let model_url = selectedItem?.model_url;

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("item-models")
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) {
        showToast("Error uploading model file.");
        setUploading(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from("item-models")
        .getPublicUrl(fileName);
        
      model_url = publicUrl;
    }

    const itemData = {
      label: formData.label,
      display_name: formData.display_name,
      category: formData.category,
      model_url
    };

    if (selectedItem?.id) {
      const { error } = await supabase
        .from("shared_activity_objects")
        .update(itemData)
        .eq("id", selectedItem.id);

      if (error) showToast("Error updating item.");
      else {
        showToast("Item updated.");
        setShowEditModal(false);
        fetchItems();
      }
    } else {
      const { error } = await supabase
        .from("shared_activity_objects")
        .insert(itemData);

      if (error) showToast("Error creating item.");
      else {
        showToast("Item created.");
        setShowCreateModal(false);
        fetchItems();
      }
    }
    setUploading(false);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete ${item.display_name}?`)) return;

    const { error } = await supabase
      .from("shared_activity_objects")
      .delete()
      .eq("id", item.id);

    if (error) showToast("Error deleting item.");
    else {
      showToast("Item deleted.");
      fetchItems();
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      label: item.label,
      display_name: item.display_name,
      category: item.category || "",
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setFormData({
      label: "",
      display_name: "",
      category: "",
    });
    setShowCreateModal(true);
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
      title="Items Library"
      subtitle={`${filteredItems.length} global items available for teachers`}
      actions={
        <PrimaryButton onClick={openCreateModal}>
          <Plus size={18} /> Create Item
        </PrimaryButton>
      }
    >
      <div className="admin-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, label or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No items found</h3>
          <p>Try adjusting your search or create a new global item</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Label</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="table-avatar">
                      <Package size={16} />
                    </div>
                    {item.display_name}
                  </td>
                  <td><code>{item.label}</code></td>
                  <td>{item.category || "Uncategorized"}</td>
                  <td>
                    <div className="table-actions">
                      <SecondaryButton 
                        onClick={() => setViewingItem(item)}
                        className="action-btn-small" 
                        title="View 3D Model"
                      >
                        <Eye size={14} />
                      </SecondaryButton>
                      <SecondaryButton 
                        onClick={() => openEditModal(item)}
                        className="action-btn-small" 
                        title="Edit Item"
                      >
                        <Edit2 size={14} />
                      </SecondaryButton>
                      <DangerButton
                        onClick={() => handleDelete(item)}
                        className="action-btn-small"
                        title="Delete Item"
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

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{showEditModal ? "Edit Item" : "Create New Item"}</h2>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g. Bottle"
                  required
                />
              </div>
              <div className="form-group">
                <label>Label (ML output) *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. bottle"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Home"
                />
              </div>
              <div className="form-group">
                <label>3D Model (.glb) {showEditModal ? "(Optional)" : "*"}</label>
                <input 
                  type="file" 
                  name="model_file" 
                  accept=".glb" 
                  required={!showEditModal}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} 
                />
                {selectedItem?.model_url && <p style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: "var(--text-success)" }}>Current model: {selectedItem.model_url.split('/').pop()}</p>}
              </div>
              <div className="modal-footer">
                <SecondaryButton onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>Cancel</SecondaryButton>
                <PrimaryButton type="submit" disabled={uploading}>
                  <Save size={16} /> {uploading ? "Uploading..." : (showEditModal ? "Save Changes" : "Create Item")}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <ModelPreviewModal 
          item={viewingItem} 
          onClose={() => setViewingItem(null)} 
        />
      )}
    </AdminLayout>
  );
}
