import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Field, StatusPill } from "../../components/ui/Card.jsx";
import { Select, TextArea } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";

export default function ModuleEditPage({ moduleId }) {
  const {
    navigate,
    getModuleView,
    moduleDrafts,
    setModuleDrafts,
    pendingFlow,
    setPendingFlow,
    showToast,
  } = useApp();
  const baseModule = getModuleView(moduleId, moduleDrafts);
  const [moduleType, setModuleType] = useState(
    pendingFlow?.kind === "draft-module" ? pendingFlow.type : baseModule.type,
  );
  const [items, setItems] = useState(() => {
    if (
      pendingFlow?.kind === "draft-module" &&
      pendingFlow.moduleId === moduleId
    ) {
      return pendingFlow.items ?? [];
    }
    return baseModule.items.map((item) => ({ ...item }));
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    if (
      pendingFlow?.kind === "draft-module" &&
      pendingFlow.moduleId === moduleId
    ) {
      setModuleType(pendingFlow.type);
      setItems(pendingFlow.items ?? []);
    }
  }, [pendingFlow, moduleId]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: `item-${Date.now()}`,
        label: moduleType === "identify" ? "Bottle" : "Notebook",
        description: "",
      },
    ]);
    showToast(`Item ${items.length + 1} added.`);
  };

  const removeItem = () => {
    if (deleteTarget == null) return;
    setItems((current) => current.filter((_, index) => index !== deleteTarget));
    setDeleteTarget(null);
    showToast("Item removed.");
  };

  const moveItem = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const saveChanges = () => {
    setModuleDrafts((current) => ({
      ...current,
      [moduleId]: { type: moduleType, items },
    }));
    setPendingFlow(null);
    navigate(`/modules/${moduleId}`);
    showToast("Module saved.");
  };

  const cancelChanges = () => {
    setPendingFlow(null);
    navigate(`/modules/${moduleId}`);
    showToast("Edits discarded.");
  };

  return (
    <PageShell
      eyebrow={`Module / ${moduleId} / Edit`}
      title="Edit module content"
      actions={
        <>
          <PrimaryButton onClick={addItem}>
            <Plus size={16} aria-hidden="true" />
            Add item
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate(`/modules/${moduleId}`)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to module
          </SecondaryButton>
        </>
      }
    >
      <div className="editor-topbar">
        <Field label="Module type">
          <Select
            value={moduleType}
            onChange={(event) => setModuleType(event.target.value)}
          >
            <option value="identify">Identify</option>
            <option value="search">Search</option>
          </Select>
        </Field>
        <StatusPill tone="accent">Drag cards to reorder</StatusPill>
      </div>
      <div className="stack editor-stack">
        {items.length === 0 ? (
          <Card className="empty-state">
            <h3>No items found</h3>
            <p>Add the first item to begin building the module.</p>
          </Card>
        ) : null}
        {items.map((item, index) => (
          <Card
            key={item.id}
            className="editor-card"
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex != null) {
                moveItem(dragIndex, index);
                setDragIndex(null);
              }
            }}
          >
            <div className="editor-card-top">
              <div className="item-index">{index + 1}</div>
              <button
                type="button"
                className="icon-button danger"
                onClick={() => setDeleteTarget(index)}
                aria-label="Remove item"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="editor-grid">
              <Field label="Item name">
                <Select
                  value={item.label}
                  onChange={(event) =>
                    updateItem(index, "label", event.target.value)
                  }
                >
                  {(moduleType === "identify"
                    ? ["Bottle", "Chair", "Notebook", "Lamp", "Apple"]
                    : ["Eraser", "Marker", "Ruler", "Scissors", "Folder"]
                  ).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              {moduleType === "identify" ? (
                <div className="model-preview">
                  <div className="model-shape" aria-hidden="true">
                    <span />
                  </div>
                  <strong>{item.label}</strong>
                  <p>Rendered model preview for the selected object.</p>
                </div>
              ) : null}
              <Field label="Description">
                <TextArea
                  rows="3"
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, "description", event.target.value)
                  }
                  placeholder="Write the item description"
                />
              </Field>
            </div>
            <div className="drag-hints">
              <span>Drag card to reorder</span>
              <span>Drop above or below another item</span>
            </div>
          </Card>
        ))}
      </div>
      <div className="editor-actions">
        <SecondaryButton onClick={cancelChanges}>Cancel</SecondaryButton>
        <PrimaryButton onClick={saveChanges}>Save changes</PrimaryButton>
      </div>
      {deleteTarget != null ? (
        <Modal
          title="Remove item?"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setDeleteTarget(null)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={removeItem}>Remove</PrimaryButton>
            </>
          }
        >
          <p>This action removes the item from the current module draft.</p>
        </Modal>
      ) : null}
    </PageShell>
  );
}
