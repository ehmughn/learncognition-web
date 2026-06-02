import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";
import { formatDateTime } from "../../utils/formatting.js";
import { supabase } from "../../services/integrations.js";

export default function ModuleStudentsPage({ moduleId }) {
  const { navigate, getModuleView, workspaceSummary } = useApp();
  const module = getModuleView(moduleId);
  const [moduleStudents, setModuleStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (module?.students?.length > 0) {
      fetchModuleStudents();
    } else {
      setLoading(false);
    }
  }, [module]);

  const fetchModuleStudents = async () => {
    setLoading(true);
    try {
      // Fetch profile data for assigned student IDs
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, created_at, avatar_url")
        .in("id", module.students);

      if (error) throw error;

      // Map profiles to match the expected student object structure
      const studentsData = (data || []).map(p => ({
        id: p.id,
        name: p.full_name,
        joinedAt: p.created_at,
        score: null, // Default to null, could fetch actual progress later
        avatarUrl: p.avatar_url
      }));

      setModuleStudents(studentsData);
    } catch (error) {
      console.error("Error fetching module students:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!module) {
    return (
      <PageShell
        title={workspaceSummary.live ? "Module unavailable" : "Loading module"}
        actions={
          <SecondaryButton onClick={() => navigate(`/modules/${moduleId}`)}>
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

  return (
    <PageShell
      title="Students"
      actions={
        <SecondaryButton onClick={() => navigate(`/modules/${moduleId}`)}>
          Back to module
        </SecondaryButton>
      }
    >
      <Card className="dashboard-table-card">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Students enrolled</p>
            <h3>{moduleStudents.length} students</h3>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? (
            <p style={{ padding: "2rem", textAlign: "center" }} className="muted">Loading students...</p>
          ) : moduleStudents.length ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {moduleStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => navigate(`/student/${student.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="table-avatar" style={{ margin: 0, width: "32px", height: "32px", fontSize: "0.8rem" }}>
                          {student.name?.[0]?.toUpperCase()}
                        </div>
                        <strong>{student.name}</strong>
                      </div>
                    </td>
                    <td>{formatDateTime(student.joinedAt)}</td>
                    <td>
                      <StatusPill tone="neutral">Enrolled</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>
                {workspaceSummary.live
                  ? "No students enrolled yet"
                  : "Loading students"}
              </h3>
              <p>
                {workspaceSummary.live
                  ? "Share this module with students to see them here."
                  : "Waiting for student rows to sync from Supabase."}
              </p>
            </div>
          )}
        </div>
      </Card>
    </PageShell>
  );
}

