import { Mail } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AuthShell } from "../../components/layout/AuthShell.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton } from "../../components/ui/Button.jsx";
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
    <AuthShell
      title="Forgot password"
      subtitle="Request a reset code and continue in a clean two-step flow."
      footerLinks={[
        { label: "Log in", to: "/login" },
        { label: "Register", to: "/register" },
      ]}
      backTo="/"
    >
      <div className="auth-stack">
        <form className="form-stack auth-form" onSubmit={requestCode}>
          <Field label="Email address">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teacher@school.edu"
            />
          </Field>
          <PrimaryButton type="submit" className="full-width">
            <Mail size={16} aria-hidden="true" />
            Send reset code
          </PrimaryButton>
        </form>

        {codeSent ? (
          <>
            <div className="auth-divider" aria-hidden="true" />
            <form className="form-stack auth-form" onSubmit={continueToReset}>
              <Field label="Reset code">
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder={sentCode}
                />
              </Field>
              <PrimaryButton type="submit" className="full-width">
                Continue to reset password
              </PrimaryButton>
            </form>
          </>
        ) : null}
      </div>
    </AuthShell>
  );
}
