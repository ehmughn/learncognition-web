import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";
import { formatDateOnly } from "../../utils/formatting.js";

export default function StudentProfilePage({ studentId }) {
  const { navigate, getStudentView, workspaceSummary } = useApp();
  const student = getStudentView(studentId);
  if (!student) {
    return (
      <PageShell
        eyebrow={`Student / ${studentId}`}
        title={
          workspaceSummary.live ? "Student unavailable" : "Loading student"
        }
        actions={
          <SecondaryButton onClick={() => navigate("/modules")}>
            Back to modules
          </SecondaryButton>
        }
      >
        <Card className="empty-state">
          <h3>
            {workspaceSummary.live
              ? "No student found"
              : "Loading from Supabase"}
          </h3>
          <p>
            {workspaceSummary.live
              ? "This student is not present in the current Supabase workspace data."
              : "Waiting for the workspace rows to finish loading."}
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={`Student / ${student.id}`}
      title={student.name}
      actions={
        <SecondaryButton onClick={() => navigate("/modules")}>
          Back to modules
        </SecondaryButton>
      }
    >
      <div className="content-grid profile-grid">
        <Card>
          <p className="eyebrow">Profile</p>
          <h3>{student.name}</h3>
          <p>{student.description}</p>
          <div className="profile-metadata">
            <span>Joined: {formatDateOnly(student.joinedAt)}</span>
            <span>Score: {student.score ?? "Not yet taken"}%</span>
            <span>Modules: {student.modulesTaken.length}</span>
          </div>
        </Card>
        <Card>
          <p className="eyebrow">Recent records</p>
          {student.records.length ? (
            <div className="stack">
              {student.records.slice(0, 3).map((record) => (
                <div className="activity-row" key={record.module}>
                  <div>
                    <strong>{record.module}</strong>
                    <p>{record.date}</p>
                  </div>
                  <StatusPill tone={record.score > 0 ? "accent" : "neutral"}>
                    {record.score > 0 ? `${record.score}%` : "Pending"}
                  </StatusPill>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No records yet</h3>
              <p>
                Student activity records will appear here once Supabase rows are
                available.
              </p>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
