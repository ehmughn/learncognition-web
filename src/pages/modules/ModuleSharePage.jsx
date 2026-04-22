import { ArrowLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageShell } from "../../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../../components/ui/Card.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";

export default function ModuleSharePage({ moduleId }) {
  const {
    navigate,
    getModuleView,
    students,
    notifications,
    addNotification,
    showToast,
    workspaceSummary,
  } = useApp();
  const module = getModuleView(moduleId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  if (!module) {
    return (
      <PageShell
        eyebrow={`Module / ${moduleId} / Share`}
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
  const visibleStudents = students.filter((student) =>
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
    const selectedNames = students
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
              <SecondaryButton
                onClick={() => navigate(`/modules/${module.id}`)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to module
              </SecondaryButton>
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
            <div className="share-step highlight">
              <strong>{module.students.length}</strong>
              <span>active learners</span>
            </div>
          </div>
        </Card>

        <div className="content-grid two-column">
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

          <Card>
            <p className="eyebrow">Recipient overview</p>
            <div className="stack">
              <div className="summary-row">
                <strong>Students in module</strong>
                <span>{module.students.length}</span>
              </div>
              <div className="summary-row">
                <strong>Searchable recipients</strong>
                <span>{students.length}</span>
              </div>
              <div className="summary-row">
                <strong>Quick share mode</strong>
                <span>List + direct send</span>
              </div>
            </div>
          </Card>
        </div>
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
          <ul className="student-select-list">
            {visibleStudents.map((student) => (
              <li className="student-check" key={student.id}>
                <label>
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
              </li>
            ))}
          </ul>
        </Modal>
      ) : null}
    </PageShell>
  );
}
