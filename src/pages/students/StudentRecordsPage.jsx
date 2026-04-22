import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";

export default function StudentRecordsPage({ studentId }) {
  const { navigate, getStudentView, workspaceSummary } = useApp();
  const student = getStudentView(studentId);
  if (!student) {
    return (
      <PageShell
        eyebrow={`Student / ${studentId} / Records`}
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
      eyebrow={`Student / ${student.id} / Records`}
      title="Student records"
      actions={
        <SecondaryButton onClick={() => navigate(`/student/${student.id}`)}>
          Back to student
        </SecondaryButton>
      }
    >
      <div className="content-grid">
        <Card className="dashboard-table-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Student records</p>
              <h3>{student.name}</h3>
            </div>
          </div>
          <div className="table-wrap">
            {student.records.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Score</th>
                    <th>Items</th>
                    <th>Duration</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {student.records.map((record) => (
                    <tr key={record.module}>
                      <td>{record.module}</td>
                      <td>
                        {record.score > 0 ? `${record.score}%` : "Pending"}
                      </td>
                      <td>{record.objects}</td>
                      <td>{record.duration}</td>
                      <td>{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <h3>No records yet</h3>
                <p>
                  Student activity rows will appear here once Supabase contains
                  live records.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
