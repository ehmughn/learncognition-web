import { ScanSearch, Search } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { CenteredShell } from "../components/layout/CenteredShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";

export default function CreateModulesPage() {
  const { navigate, createModule, showToast } = useApp();

  const chooseModule = async (type) => {
    try {
      const module = await createModule(type);
      showToast(
        `${module.type === "identify" ? "Identify" : "Search"} module created.`,
      );
      navigate(`/modules/${module.id}/edit`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to create module.",
      );
    }
  };

  return (
    <CenteredShell title="Pick a module activity type" backTo="/modules">
      <div className="create-grid-centered">
        <Card className="choice-card accent">
          <div className="choice-copy">
            <p className="eyebrow">Identify</p>
            <h3>Object-based activity with model previews.</h3>
            <p>
              Choose from a dropdown of objects, see a rendered object model,
              and write a description for the item.
            </p>
          </div>
          <PrimaryButton
            className="choice-button"
            onClick={() => chooseModule("identify")}
          >
            <ScanSearch size={16} aria-hidden="true" />
            Create Identify module
          </PrimaryButton>
        </Card>
        <Card className="choice-card">
          <div className="choice-copy">
            <p className="eyebrow">Search</p>
            <h3>Sequence-based activity with a tighter classroom hunt flow.</h3>
            <p>
              Use item names plus a description field to shape a search-oriented
              module that students can complete in order.
            </p>
          </div>
          <PrimaryButton
            className="choice-button"
            onClick={() => chooseModule("search")}
          >
            <Search size={16} aria-hidden="true" />
            Create Search module
          </PrimaryButton>
        </Card>
      </div>
    </CenteredShell>
  );
}
