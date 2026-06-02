import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Plus,
  Trash2,
  Package,
  Search,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "@google/model-viewer";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, Field } from "../../components/ui/Card.jsx";
import { Input, Select, TextArea } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { getIdentifyModelAsset } from "../../constants/modelAssets.js";
import { supabase } from "../../services/integrations.js";

function IdentifyModelPreview({ label, modelUrl }) {
  const asset = getIdentifyModelAsset(label) || {};
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.src = modelUrl || asset.src || "";
    viewer.alt = `${label} preview rendered`;
    viewer.cameraControls = true;
    viewer.autoRotate = true;
    viewer.interactionPrompt = "none";
    viewer.shadowIntensity = 1;
    viewer.toneMapping = "aces";
    viewer.exposure = 1;
    viewer.cameraOrbit = "45deg 70deg 2.8m";
    viewer.minCameraOrbit = "auto auto 1.6m";
    viewer.maxCameraOrbit = "auto auto 5m";
    viewer.disableZoom = false;
  }, [asset.src, label, modelUrl]);

  return (
    <div className="model-preview">
      <div className="model-preview-stage">
        <model-viewer ref={viewerRef} className="model-viewer" />
      </div>
      <div className="model-preview-meta">
        <strong>Preview</strong>
      </div>
    </div>
  );
}

export default function ModuleEditPage({ moduleId }) {
  const { navigate, getModuleView, saveModule, showToast, workspaceSummary } =
    useApp();
  const baseModule = getModuleView(moduleId);
  const [moduleName, setModuleName] = useState(baseModule?.name ?? "");
  const [moduleDescription, setModuleDescription] = useState(
    baseModule?.description ?? "",
  );
  const [moduleType, setModuleType] = useState(baseModule?.type ?? "identify");
  const [items, setItems] = useState(
    () => baseModule?.items.map((item) => ({ ...item })) ?? [],
  );
  const [itemPreviewDescriptions, setItemPreviewDescriptions] = useState(() =>
    Object.fromEntries(
      (baseModule?.items ?? []).map((item) => [
        item.id,
        item.description ?? "",
      ]),
    ),
  );
  const [expandedItems, setExpandedItems] = useState(() =>
    Object.fromEntries(
      (baseModule?.items ?? []).map((item) => [item.id, true]),
    ),
  );
  const itemCardRefs = useRef(new Map());
  const previousItemRects = useRef(new Map());
  const previousItemOrder = useRef(items.map((item) => item.id));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

  const fetchLibraryItems = async () => {
    setLibraryLoading(true);
    const { data, error } = await supabase
      .from("shared_activity_objects")
      .select("*")
      .order("display_name", { ascending: true });

    if (error) {
      showToast("Error fetching library items.");
    } else {
      setLibraryItems(data || []);
    }
    setLibraryLoading(false);
  };

  useEffect(() => {
    fetchLibraryItems();
  }, []);

  const importItem = (libItem) => {
    const nextItem = {
      id: `item-${Date.now()}`,
      label: libItem.label,
      description: libItem.display_name,
      model_url: libItem.model_url,
    };

    setItems((current) => [...current, nextItem]);
    setItemPreviewDescriptions((current) => ({
      ...current,
      [nextItem.id]: nextItem.description,
    }));
    setExpandedItems((current) => ({ ...current, [nextItem.id]: true }));
    setIsLibraryModalOpen(false);
    showToast(`Imported ${libItem.display_name}.`);
  };

  const filteredLibrary = libraryItems.filter(
    (item) =>
      item.display_name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      item.label.toLowerCase().includes(librarySearch.toLowerCase()),
  );

  if (!baseModule) {
    return (
      <PageShell
        eyebrow={`Module / ${moduleId} / Edit`}
        title={workspaceSummary.live ? "Module unavailable" : "Loading module"}
        actions={
          <SecondaryButton onClick={() => navigate(`/modules/${moduleId}`)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to module
          </SecondaryButton>
        }
      >
        <Card className="empty-state">
          <h3>
            {workspaceSummary.live
              ? "No module found"
              : "Loading from Supabase"}
          </h3>
          <p>
            {workspaceSummary.live
              ? "This module is not present in the current Supabase workspace data."
              : "Waiting for the workspace rows to finish loading."}
          </p>
        </Card>
      </PageShell>
    );
  }

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const commitItemPreviewDescription = (itemId, description) => {
    setItemPreviewDescriptions((current) => ({
      ...current,
      [itemId]: description,
    }));
  };

  useLayoutEffect(() => {
    const currentRects = new Map();
    const currentOrder = items.map((item) => item.id);
    const orderChanged =
      currentOrder.length !== previousItemOrder.current.length ||
      currentOrder.some(
        (itemId, index) => itemId !== previousItemOrder.current[index],
      );

    items.forEach((item) => {
      const node = itemCardRefs.current.get(item.id);
      if (!node) return;
      currentRects.set(item.id, node.getBoundingClientRect());
    });

    if (!orderChanged) {
      previousItemRects.current = currentRects;
      previousItemOrder.current = currentOrder;
      return;
    }

    items.forEach((item) => {
      const node = itemCardRefs.current.get(item.id);
      const previousRect = previousItemRects.current.get(item.id);
      const currentRect = currentRects.get(item.id);

      if (!node || !previousRect || !currentRect) return;

      const deltaX = previousRect.left - currentRect.left;
      const deltaY = previousRect.top - currentRect.top;

      if (!deltaX && !deltaY) return;

      node.animate(
        [
          {
            transform: `translate(${deltaX}px, ${deltaY}px)`,
          },
          {
            transform: "translate(0, 0)",
          },
        ],
        {
          duration: 240,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    });

    previousItemRects.current = currentRects;
    previousItemOrder.current = currentOrder;
  }, [items]);

  const toggleItemExpanded = (itemId) => {
    setExpandedItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  };

  const addItem = () => {
    const defaultLibItem =
      libraryItems.length > 0 ? libraryItems[0] : { label: "", model_url: "" };

    const nextItem = {
      id: `item-${Date.now()}`,
      label: defaultLibItem.label,
      description: "",
      model_url: defaultLibItem.model_url,
    };

    setItems((current) => [...current, nextItem]);
    setItemPreviewDescriptions((current) => ({
      ...current,
      [nextItem.id]: "",
    }));
    setExpandedItems((current) => ({ ...current, [nextItem.id]: true }));
    showToast(`Item ${items.length + 1} added.`);
  };

  const removeItem = () => {
    if (deleteTarget == null) return;

    const removedItem = items[deleteTarget];
    setItems((current) => current.filter((_, index) => index !== deleteTarget));
    if (removedItem) {
      setItemPreviewDescriptions((current) => {
        const next = { ...current };
        delete next[removedItem.id];
        return next;
      });
      setExpandedItems((current) => {
        const next = { ...current };
        delete next[removedItem.id];
        return next;
      });
    }
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

  const allItemsCollapsed =
    items.length > 0 && items.every((item) => expandedItems[item.id] === false);

  const toggleAllItems = () => {
    const nextExpanded = allItemsCollapsed;
    setExpandedItems((current) => {
      const next = { ...current };

      items.forEach((item) => {
        next[item.id] = nextExpanded;
      });

      return next;
    });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await saveModule({
        ...baseModule,
        name: moduleName.trim() || baseModule.name,
        description: moduleDescription.trim(),
        type: moduleType,
        items,
      });
      navigate(`/modules/${moduleId}`);
      showToast("Module saved.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to save module.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const cancelChanges = () => {
    navigate(`/modules/${moduleId}`);
    showToast("Edits discarded.");
  };

  const confirmSaveChanges = async () => {
    setPendingAction(null);
    await saveChanges();
  };

  const confirmCancelChanges = () => {
    setPendingAction(null);
    cancelChanges();
  };

  return (
    <PageShell
      title="EDIT MODULE"
      subtitle={moduleDescription.trim() || baseModule.description || ""}
      actions={
        <>
          <SecondaryButton onClick={() => navigate(`/modules/${moduleId}`)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to module
          </SecondaryButton>
        </>
      }
    >
      <Card className="editor-header-card">
        <h3 className="editor-header-title">Module Label</h3>
        <div className="editor-header-fields">
          <Field label="Module name">
            <Input
              value={moduleName}
              onChange={(event) => setModuleName(event.target.value)}
              placeholder="Enter module name"
            />
          </Field>
          <Field label="Module description">
            <TextArea
              rows="4"
              value={moduleDescription}
              onChange={(event) => setModuleDescription(event.target.value)}
              placeholder="Write a short description for this module"
            />
          </Field>
        </div>
      </Card>

      <div className="editor-section-header">
        <h3>All Items</h3>
        <div
          className="editor-section-actions"
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <PrimaryButton onClick={addItem}>
            <Plus size={16} aria-hidden="true" />
            Add item
          </PrimaryButton>
          {items.length > 0 ? (
            <SecondaryButton
              className="editor-section-button"
              onClick={toggleAllItems}
            >
              {allItemsCollapsed ? "Expand all" : "Collapse all"}
            </SecondaryButton>
          ) : null}
        </div>
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
            ref={(node) => {
              if (node) {
                itemCardRefs.current.set(item.id, node);
              } else {
                itemCardRefs.current.delete(item.id);
              }
            }}
            className={`editor-card ${expandedItems[item.id] === false ? "is-collapsed" : ""}`.trim()}
          >
            <div
              className="editor-card-top"
              role="button"
              tabIndex={0}
              aria-expanded={expandedItems[item.id] !== false}
              aria-label={`${expandedItems[item.id] === false ? "Expand" : "Collapse"} item ${index + 1}`}
              title={
                expandedItems[item.id] === false
                  ? "Expand item"
                  : "Collapse item"
              }
              onClick={(event) => {
                if (event.target.closest("button")) return;
                toggleItemExpanded(item.id);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                toggleItemExpanded(item.id);
              }}
            >
              <div className="editor-card-meta">
                <ChevronDown
                  className={`editor-card-state-icon ${expandedItems[item.id] === false ? "collapsed" : ""}`.trim()}
                  size={16}
                  aria-hidden="true"
                />
                <div className="item-index">{index + 1}</div>
                <div className="editor-card-title-copy">
                  <strong>{item.label}</strong>
                  <span>
                    {itemPreviewDescriptions[item.id]?.trim() ||
                      "No description yet"}
                  </span>
                </div>
              </div>
              <div className="editor-card-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move item ${index + 1} up`}
                  title="Move up"
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move item ${index + 1} down`}
                  title="Move down"
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => setDeleteTarget(index)}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            {expandedItems[item.id] !== false ? (
              <div className="editor-card-body">
                <div className="editor-grid">
                  <div className="editor-item-fields">
                    <Field label="Item name">
                      <Select
                        value={item.label}
                        onChange={(event) => {
                          const selectedLabel = event.target.value;
                          const libItem = libraryItems.find(
                            (l) => l.label === selectedLabel,
                          );
                          setItems((current) =>
                            current.map((it, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...it,
                                    label: selectedLabel,
                                    model_url:
                                      libItem?.model_url || it.model_url,
                                  }
                                : it,
                            ),
                          );
                        }}
                      >
                        {libraryItems.length > 0 ? (
                          libraryItems.map((libItem) => (
                            <option key={libItem.id} value={libItem.label}>
                              {libItem.display_name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No items available in library
                          </option>
                        )}
                      </Select>
                    </Field>
                    <Field label="Description">
                      <TextArea
                        rows="3"
                        value={item.description}
                        onChange={(event) =>
                          updateItem(index, "description", event.target.value)
                        }
                        onBlur={(event) =>
                          commitItemPreviewDescription(
                            item.id,
                            event.target.value,
                          )
                        }
                        placeholder="Write the item description"
                      />
                    </Field>
                  </div>
                  {moduleType === "identify" ? (
                    <IdentifyModelPreview
                      label={item.label}
                      modelUrl={
                        item.model_url ||
                        libraryItems.find((l) => l.label === item.label)
                          ?.model_url
                      }
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
      <div className="editor-actions">
        <SecondaryButton onClick={() => setPendingAction("cancel")}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={() => setPendingAction("save")}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </PrimaryButton>
      </div>
      {pendingAction === "save" ? (
        <Modal
          title="Save changes?"
          onClose={() => setPendingAction(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setPendingAction(null)}>
                Keep editing
              </SecondaryButton>
              <PrimaryButton onClick={confirmSaveChanges} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </PrimaryButton>
            </>
          }
        >
          <p>This will save the module title, description, and item changes.</p>
        </Modal>
      ) : null}
      {pendingAction === "cancel" ? (
        <Modal
          title="Discard edits?"
          onClose={() => setPendingAction(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setPendingAction(null)}>
                Keep editing
              </SecondaryButton>
              <PrimaryButton onClick={confirmCancelChanges}>
                Discard changes
              </PrimaryButton>
            </>
          }
        >
          <p>
            This will leave the page and discard any unsaved module changes.
          </p>
        </Modal>
      ) : null}
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
          <p>This action removes the item from the current module.</p>
        </Modal>
      ) : null}
      {isLibraryModalOpen && (
        <Modal
          title="Import from Library"
          onClose={() => setIsLibraryModalOpen(false)}
          wide
        >
          <div className="library-search" style={{ marginBottom: "1rem" }}>
            <Field label="Search Library">
              <div className="input-with-icon">
                <Search size={16} />
                <Input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search by name or label..."
                />
              </div>
            </Field>
          </div>
          <div
            className="library-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {libraryLoading ? (
              <p>Loading library...</p>
            ) : filteredLibrary.length === 0 ? (
              <p>No matching items found.</p>
            ) : (
              filteredLibrary.map((item) => (
                <div
                  key={item.id}
                  className="library-item-card"
                  style={{
                    padding: "1rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                  }}
                  onClick={() => importItem(item)}
                >
                  <strong>{item.display_name}</strong>
                  <p className="subtitle" style={{ fontSize: "0.75rem" }}>
                    Label: {item.label}
                  </p>
                  <p className="subtitle" style={{ fontSize: "0.75rem" }}>
                    Category: {item.category || "Uncategorized"}
                  </p>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
