import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";
import { studentsSeed } from "../../constants/students.js";
import { formatDateTime } from "../../utils/formatting.js";

export default function ModuleStudentsPage({ moduleId }) {
  const { navigate, getModuleView, moduleDrafts } = useApp();
  const module = getModuleView(moduleId, moduleDrafts);
  const students = studentsSeed.filter((student) =>
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
            <h3>{students.length} students</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Join Date</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
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
        </div>
      </Card>
    </PageShell>
  );
}
