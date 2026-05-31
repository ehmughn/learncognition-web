import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { Plus, Trash2, Save, Package } from "lucide-react";
import { supabase } from "../../services/integrations.js";

export default function AdminItemsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

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
      showToast("Error fetching shared items.");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const itemData = {
      label: formData.get("label"),
      display_name: formData.get("display_name"),
      category: formData.get("category"),
    };

    if (editingItem?.id) {
      const { error } = await supabase
        .from("shared_activity_objects")
        .update(itemData)
        .eq("id", editingItem.id);

      if (error) showToast("Error updating item.");
      else {
        showToast("Item updated.");
        setEditingItem(null);
        fetchItems();
      }
    } else {
      const { error } = await supabase
        .from("shared_activity_objects")
        .insert(itemData);

      if (error) showToast("Error creating item.");
      else {
        showToast("Item created.");
        setEditingItem(null);
        fetchItems();
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const { error } = await supabase
      .from("shared_activity_objects")
      .delete()
      .eq("id", id);

    if (error) showToast("Error deleting item.");
    else {
      showToast("Item deleted.");
      fetchItems();
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
      title="Global Items Library"
      subtitle="Manage objects that teachers can import into their modules."
      actions={
        <PrimaryButton onClick={() => setEditingItem({})}>
          <Plus size={16} /> Add New Item
        </PrimaryButton>
      }
    >
      {editingItem && (
        <Card title={editingItem.id ? "Edit Item" : "New Item"}>
          <form className="form-stack" onSubmit={handleSave}>
            <div className="grid-2">
              <Field label="Label (ML output)">
                <Input name="label" defaultValue={editingItem.label} placeholder="e.g. bottle" required />
              </Field>
              <Field label="Display Name">
                <Input name="display_name" defaultValue={editingItem.display_name} placeholder="e.g. Bottle" required />
              </Field>
            </div>
            <Field label="Category">
              <Input name="category" defaultValue={editingItem.category} placeholder="e.g. Home" />
            </Field>
            <div className="form-actions" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <PrimaryButton type="submit">
                <Save size={16} /> Save Item
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => setEditingItem(null)}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </Card>
      )}

      <div className="admin-list-container" style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
          <p>No items in the library yet.</p>
        ) : (
          <div className="dashboard-grid">
            {items.map((item) => (
              <Card key={item.id} title={item.display_name} icon={<Package size={18} />}>
                <p className="subtitle">Label: {item.label}</p>
                <p className="subtitle">Category: {item.category || "Uncategorized"}</p>
                <div className="card-actions" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                  <SecondaryButton onClick={() => setEditingItem(item)}>
                    Edit
                  </SecondaryButton>
                  <SecondaryButton onClick={() => handleDelete(item.id)} style={{ color: "var(--text-danger)" }}>
                    <Trash2 size={16} />
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
