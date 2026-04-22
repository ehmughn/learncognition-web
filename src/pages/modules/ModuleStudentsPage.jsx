import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";
import { formatDateTime } from "../../utils/formatting.js";

export default function ModuleStudentsPage({ moduleId }) {
  const { navigate, getModuleView, students, workspaceSummary } = useApp();
  const module = getModuleView(moduleId);
  if (!module) {
    return (
      <PageShell
        eyebrow={`Module / ${moduleId} / Students`}
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
  const moduleStudents = students.filter((student) =>
    module.students.includes(student.id),
  );

  return (
    <PageShell
      eyebrow={`Module / ${moduleId} / Students`}
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
          {moduleStudents.length ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Join Date</th>
                  <th>Score</th>
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
                      <strong>{student.name}</strong>
                    </td>
                    <td>{formatDateTime(student.joinedAt)}</td>
                    <td>
                      {student.score == null ? (
                        <StatusPill tone="neutral">Pending</StatusPill>
                      ) : (
                        <StatusPill tone="accent">{student.score}%</StatusPill>
                      )}
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
                  ? "Add student rows in Supabase or share this module to populate the roster."
                  : "Waiting for student rows to sync from Supabase."}
              </p>
            </div>
          )}
        </div>
      </Card>
    </PageShell>
  );
}
