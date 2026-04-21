import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";
import { findStudent } from "../../utils/dataHelpers.js";
import { formatDateOnly } from "../../utils/formatting.js";

export default function StudentProfilePage({ studentId }) {
  const { navigate } = useApp();
  const student = findStudent(studentId);

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
        </Card>
      </div>
    </PageShell>
  );
}
