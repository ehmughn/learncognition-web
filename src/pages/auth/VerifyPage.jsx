import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { GuestShell } from "../../components/layout/GuestShell.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { AppLink } from "../../components/ui/AppLink.jsx";

export default function VerifyPage() {
  const { pendingFlow, setPendingFlow, setSession, navigate, showToast } =
    useApp();
  const [code, setCode] = useState("");
  const expectedCode = pendingFlow?.code ?? "";

  const submit = (event) => {
    event.preventDefault();
    if (!pendingFlow) {
      showToast("Start a login or registration flow first.");
      return;
    }
    if (code !== expectedCode) {
      showToast("That verification code is incorrect.");
      return;
    }
    setPendingFlow(null);
    setSession({
      authenticated: true,
      role: pendingFlow.role ?? "teacher",
      name: pendingFlow.name ?? "Ari Santos",
      email: pendingFlow.email ?? "",
      verified: true,
    });
    navigate("/");
    showToast("Verification complete.");
  };

  return (
    <GuestShell
      kicker="Verification"
      title={
        pendingFlow?.purpose === "admin-owner"
          ? "Confirm the admin account owner."
          : "Verify your teacher account."
      }
      subtitle={
        pendingFlow
          ? `We sent a code to ${pendingFlow.email}. Enter it below to continue.`
          : "There is no active verification flow. Start from login or registration."
      }
      actions={
        <>
          <AppLink to="/login" className="text-link">
            Login
          </AppLink>
          <AppLink to="/register" className="text-link">
            Register
          </AppLink>
          <AppLink to="/forgot-password" className="text-link">
            Forgot password
          </AppLink>
        </>
      }
    >
      <div className="auth-panel-stack">
        <form className="form-stack" onSubmit={submit}>
          <Field
            label="Verification code"
            hint="Use the code from the email preview in this prototype."
          >
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={expectedCode || "0000000000"}
            />
          </Field>
          <div className="form-actions">
            <PrimaryButton type="submit">Verify account</PrimaryButton>
            <SecondaryButton type="button" onClick={() => navigate("/login")}>
              Back to login
            </SecondaryButton>
          </div>
        </form>

        <div className="auth-note">
          <strong>Demo mail</strong>
          <p>
            {expectedCode
              ? `Verification code: ${expectedCode}`
              : "No pending code yet."}
          </p>
        </div>
      </div>
    </GuestShell>
  );
}
