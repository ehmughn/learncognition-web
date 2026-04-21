import { useApp } from "../context/AppContext.jsx";
import { CenteredShell } from "../components/layout/CenteredShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";

export default function CreateModulesPage() {
  const { navigate, setPendingFlow, showToast } = useApp();

  const chooseModule = (type) => {
    setPendingFlow({ kind: "draft-module", moduleId: "1", type, items: [] });
    showToast(
      `${type === "identify" ? "Identify" : "Search"} module draft created.`,
    );
    navigate("/modules/1/edit");
  };

  return (
    <CenteredShell title="Pick a module activity type">
      <div className="create-grid-centered">
        <Card className="choice-card accent">
          <p className="eyebrow">Identify</p>
          <h3>Object-based activity with model previews.</h3>
          <p>
            Choose from a dropdown of objects, see a rendered object model, and
            write a description for the item.
          </p>
          <PrimaryButton onClick={() => chooseModule("identify")}>
            Create Identify module
          </PrimaryButton>
        </Card>
        <Card className="choice-card">
          <p className="eyebrow">Search</p>
          <h3>Sequence-based activity with a tighter classroom hunt flow.</h3>
          <p>
            Use item names plus a description field to shape a search-oriented
            module that students can complete in order.
          </p>
          <PrimaryButton onClick={() => chooseModule("search")}>
            Create Search module
          </PrimaryButton>
        </Card>
      </div>
    </CenteredShell>
  );
}
