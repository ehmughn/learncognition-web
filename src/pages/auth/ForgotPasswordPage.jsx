import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { GuestShell } from "../../components/layout/GuestShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { AppLink } from "../../components/ui/AppLink.jsx";
import { makeCode } from "../../utils/formatting.js";

export default function ForgotPasswordPage() {
  const { setPendingFlow, navigate, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const requestCode = (event) => {
    event.preventDefault();
    if (!email) {
      showToast("Enter the account email first.");
      return;
    }
    const nextCode = makeCode();
    setSentCode(nextCode);
    setCodeSent(true);
    setPendingFlow({ kind: "reset", email, code: nextCode, verified: false });
    showToast(`Reset code sent to ${email}.`);
  };

  const continueToReset = (event) => {
    event.preventDefault();
    if (!codeSent) {
      showToast("Request a reset code first.");
      return;
    }
    if (code !== sentCode) {
      showToast("That reset code is incorrect.");
      return;
    }
    setPendingFlow((current) => ({ ...current, verified: true }));
    navigate("/reset-password");
    showToast("Reset code accepted.");
  };

  return (
    <GuestShell
      kicker="Password recovery"
      title="Request a password change and verify the emailed code."
      subtitle="The forgot-password page handles both the request and the code check before the reset screen opens."
      actions={
        <>
          <AppLink to="/login" className="text-link">
            Login
          </AppLink>
          <AppLink to="/register" className="text-link">
            Register
          </AppLink>
        </>
      }
    >
      <form className="form-stack" onSubmit={requestCode}>
        <Field label="Email address">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teacher@school.edu"
          />
        </Field>
        <div className="form-actions">
          <PrimaryButton type="submit">Send reset code</PrimaryButton>
        </div>
      </form>
      <form className="form-stack nested" onSubmit={continueToReset}>
        <Field label="Reset code">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={codeSent ? sentCode : "Awaiting code"}
          />
        </Field>
        <div className="form-actions">
          <SecondaryButton type="submit">
            Continue to reset password
          </SecondaryButton>
          <AppLink to="/login" className="text-link">
            Back to login
          </AppLink>
        </div>
      </form>
      <Card className="side-note">
        <p className="eyebrow">Email preview</p>
        <p>
          {codeSent
            ? `Reset code: ${sentCode}`
            : "A code preview appears here after request."}
        </p>
      </Card>
    </GuestShell>
  );
}
