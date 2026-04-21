import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { GuestShell } from "../components/layout/GuestShell.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";

export default function NotFoundPage() {
  const { navigate, session } = useApp();

  if (session.authenticated) {
    return (
      <PageShell
        eyebrow="Error"
        title="Page not found"
        subtitle="The page you're looking for doesn't exist."
        actions={
          <PrimaryButton onClick={() => navigate("/")}>
            Back to home
          </PrimaryButton>
        }
      >
        <Card>
          <p>Error 404: This page could not be found.</p>
          <p>Please use the navigation or return to the home page.</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <GuestShell
      kicker="Error"
      title="Page not found"
      subtitle="The page you're looking for doesn't exist. Please return to the landing page."
      actions={
        <PrimaryButton onClick={() => navigate("/")}>
          Return to home
        </PrimaryButton>
      }
    >
      <Card>
        <p>Error 404: This page could not be found.</p>
      </Card>
    </GuestShell>
  );
}
