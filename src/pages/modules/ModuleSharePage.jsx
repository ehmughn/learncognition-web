import { ArrowLeft, Share2, Search, UserCheck, UserPlus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { supabase } from "../../services/integrations.js";

export default function ModuleSharePage({ moduleId }) {
  const {
    navigate,
    getModuleView,
    showToast,
    workspaceSummary,
    session,
    refreshWorkspace,
  } = useApp();
  
  const module = getModuleView(moduleId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      handleSearch();
    }
  }, [isModalOpen]);

  if (!module) {
    return (
      <PageShell
        title={workspaceSummary.live ? "Module unavailable" : "Loading module"}
        actions={
          <SecondaryButton onClick={() => navigate("/modules")}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to modules
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

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("role", "student")
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      showToast("Error searching students");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (student) => {
    setSelectedStudents((current) =>
      current.find(s => s.id === student.id)
        ? current.filter((s) => s.id !== student.id)
        : [...current, student],
    );
  };

  const shareNow = async () => {
    if (!selectedStudents.length) {
      showToast("Select at least one student to share with.");
      return;
    }

    setSharing(true);
    try {
      // 1. Update module student_ids
      const currentStudentIds = module.students || [];
      const newStudentIds = [...new Set([...currentStudentIds, ...selectedStudents.map(s => s.id)])];
      
      const { error: updateError } = await supabase
        .from("teacher_workspace_modules")
        .update({ student_ids: newStudentIds })
        .eq("id", module.id);

      if (updateError) throw updateError;

      // 2. Notify parents via chat
      const activityType = module.type === 'search' ? 'search' : 'identify';
      const messageContent = `I have shared a/n ${activityType} activity to your child entitled '${module.name}'`;
      
      console.log("[Sharing] Processing student notifications for:", selectedStudents.length, "students");

      for (const student of selectedStudents) {
        console.log("[Sharing] Checking parents for student:", student.full_name, "(ID:", student.id, ")");
        
        // Find linked parents
        const { data: parentLinks, error: parentError } = await supabase
          .from("parent_students")
          .select("parent_id")
          .eq("student_id", student.id);

        if (parentError) {
          console.error("[Sharing] Error fetching parent links:", parentError);
          continue;
        }

        console.log("[Sharing] Found", parentLinks?.length, "linked parents for student", student.full_name);

        for (const link of parentLinks) {
          console.log("[Sharing] Creating/Finding conversation for parent:", link.parent_id);
          
          // Find or create conversation
          const { data: conv, error: convError } = await supabase
            .from("conversations")
            .upsert({ 
              teacher_id: session.userId, 
              parent_id: link.parent_id,
              updated_at: new Date().toISOString()
            }, { onConflict: "teacher_id,parent_id" })
            .select()
            .single();

          if (convError) {
            console.error("[Sharing] Error starting conversation:", convError);
            continue;
          }

          console.log("[Sharing] Sending message to conversation:", conv.id);

          // Insert message
          const { error: msgError } = await supabase
            .from("messages")
            .insert({
              conversation_id: conv.id,
              sender_id: session.userId,
              content: messageContent
            });

          if (msgError) {
            console.error("[Sharing] Error inserting message:", msgError);
          } else {
            console.log("[Sharing] Message successfully sent to parent!");
            // Update last message
            await supabase
              .from("conversations")
              .update({ last_message: messageContent })
              .eq("id", conv.id);
          }
        }
      }

      showToast(`Module shared with ${selectedStudents.length} students. Parents notified via chat.`);
      await refreshWorkspace();
      setIsModalOpen(false);
      setSelectedStudents([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Sharing error:", error);
      showToast("Failed to share module");
    } finally {
      setSharing(false);
    }
  };

  return (
    <PageShell
      title="Share this module"
      actions={
        <>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            <Share2 size={16} aria-hidden="true" />
            Direct share
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate(`/modules/${module.id}`)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to module
          </SecondaryButton>
        </>
      }
    >
      <div className="content-grid module-share-grid">
        <Card className="share-hero">
          <div className="share-hero-copy">
            <StatusPill tone="accent">
              <Share2 size={14} aria-hidden="true" />
              Ready to share
            </StatusPill>
            <h3>{module.name}</h3>
            <p>
              Give students the code below or use direct sharing to notify a
              specific class group.
            </p>
            <div className="share-code-display">{module.code}</div>
            <div className="share-hero-actions">
              <PrimaryButton onClick={() => setIsModalOpen(true)}>
                <Share2 size={16} aria-hidden="true" />
                Direct share
              </PrimaryButton>
            </div>
          </div>

          <div className="share-hero-visual">
            <div className="share-step">
              <strong>1</strong>
              <span>Copy the code</span>
            </div>
            <div className="share-step">
              <strong>2</strong>
              <span>Send it to students</span>
            </div>
            <div className="share-step">
              <strong>3</strong>
              <span>Track who joined</span>
            </div>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <Modal
          title="Direct Share"
          onClose={() => setIsModalOpen(false)}
          footer={
            <>
              <SecondaryButton onClick={() => setIsModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={shareNow} disabled={sharing || selectedStudents.length === 0}>
                {sharing ? "Sharing..." : `Share with ${selectedStudents.length} students`}
              </PrimaryButton>
            </>
          }
        >
          <div className="messenger-search" style={{ padding: 0, marginBottom: "1rem" }}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search students by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "20px", border: "1px solid var(--border)", background: "var(--bg-secondary)" }}
              />
              <button 
                onClick={handleSearch} 
                style={{ position: "absolute", right: "10px", background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}
              >
                Search
              </button>
            </div>
          </div>

          <div className="selected-chips" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            {selectedStudents.map(student => (
              <div key={student.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600" }}>
                {student.full_name}
                <X size={14} style={{ cursor: "pointer" }} onClick={() => toggleStudent(student)} />
              </div>
            ))}
          </div>

          <div className="student-select-list" style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {loading ? (
              <p className="muted" style={{ textAlign: "center", padding: "1rem" }}>Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="muted" style={{ textAlign: "center", padding: "1rem" }}>{searchTerm ? "No students found." : "Enter a name to search students."}</p>
            ) : (
              searchResults.map((student) => {
                const isSelected = selectedStudents.some(s => s.id === student.id);
                return (
                  <div 
                    key={student.id} 
                    onClick={() => toggleStudent(student)}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "1rem", 
                      padding: "0.75rem", 
                      borderRadius: "var(--radius-md)", 
                      background: isSelected ? "var(--accent-soft)" : "var(--bg-secondary)",
                      cursor: "pointer",
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                      transition: "all 0.2s"
                    }}
                  >
                    <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}>
                      {student.full_name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "600", margin: 0, fontSize: "0.9rem" }}>{student.full_name}</p>
                      <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>{student.email}</p>
                    </div>
                    {isSelected ? <UserCheck size={18} color="var(--accent)" /> : <UserPlus size={18} className="muted" />}
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      )}

      <style>{`
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-secondary);
        }
        .muted {
          color: var(--text-secondary);
          opacity: 0.7;
        }
      `}</style>
    </PageShell>
  );
}

