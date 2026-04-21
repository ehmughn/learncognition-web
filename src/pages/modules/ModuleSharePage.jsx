import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { studentsSeed } from "../../constants/students.js";

export default function ModuleSharePage({ moduleId }) {
  const {
    navigate,
    getModuleView,
    moduleDrafts,
    notifications,
    addNotification,
    showToast,
  } = useApp();
  const module = getModuleView(moduleId, moduleDrafts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const visibleStudents = studentsSeed.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleStudent = (studentId) => {
    setSelectedStudents((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  const shareNow = () => {
    if (!selectedStudents.length) {
      showToast("Select at least one student to share with.");
      return;
    }
    const selectedNames = studentsSeed
      .filter((student) => selectedStudents.includes(student.id))
      .map((student) => student.name);
    addNotification(
      "Module shared",
      `${module.name} was sent to ${selectedNames.join(", ")}.`,
    );
    setIsModalOpen(false);
    showToast("Students received the share notification.");
  };

  return (
    <PageShell
      eyebrow={`Module / ${module.id} / Share`}
      title="Share this module"
      actions={
        <>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            Direct share
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate(`/modules/${module.id}`)}>
            Back to module
          </SecondaryButton>
        </>
      }
    >
      <div className="content-grid two-column">
        <Card>
          <p className="eyebrow">Generated share code</p>
          <div className="share-code">{module.code}</div>
          <p>
            Students can enter this code in the mobile app to join the module.
          </p>
        </Card>
        <Card>
          <p className="eyebrow">Sharing status</p>
          <div className="stack">
            <div className="summary-row">
              <strong>Notifications</strong>
              <span>{notifications.length}</span>
            </div>
            <div className="summary-row">
              <strong>Direct sharing</strong>
              <span>Available</span>
            </div>
            <div className="summary-row">
              <strong>Targeted send</strong>
              <span>Enabled</span>
            </div>
          </div>
        </Card>
      </div>
      {isModalOpen ? (
        <Modal
          title="Share with specific students"
          onClose={() => setIsModalOpen(false)}
          footer={
            <>
              <SecondaryButton onClick={() => setIsModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={shareNow}>Share module</PrimaryButton>
            </>
          }
        >
          <Field label="Search students">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by student name"
            />
          </Field>
          <div className="student-select-list">
            {visibleStudents.map((student) => (
              <label className="student-check" key={student.id}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                />
                <span>
                  <strong>{student.name}</strong>
                  <small>{student.description}</small>
                </span>
              </label>
            ))}
          </div>
        </Modal>
      ) : null}
    </PageShell>
  );
}
