import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { SecondaryButton } from "../../components/ui/Button.jsx";
import { findStudent } from "../../utils/dataHelpers.js";

export default function StudentRecordsPage({ studentId }) {
  const { navigate } = useApp();
  const student = findStudent(studentId);

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
                    <td>{record.score > 0 ? `${record.score}%` : "Pending"}</td>
                    <td>{record.objects}</td>
                    <td>{record.duration}</td>
                    <td>{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
