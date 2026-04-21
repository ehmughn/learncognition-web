import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { GuestShell } from "../../components/layout/GuestShell.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton } from "../../components/ui/Button.jsx";
import { AppLink } from "../../components/ui/AppLink.jsx";

export default function ResetPasswordPage() {
  const { pendingFlow, setPendingFlow, setSession, navigate, showToast } =
    useApp();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!password || password !== confirmPassword) {
      showToast("Passwords must match.");
      return;
    }
    setPendingFlow(null);
    setSession((current) => ({
      ...current,
      authenticated: true,
      verified: true,
      role: current.role === "guest" ? "teacher" : current.role,
      name: current.name || "Ari Santos",
    }));
    navigate("/");
    showToast("Password updated.");
  };

  return (
    <GuestShell
      kicker="Reset password"
      title="Create a new password and return to the teacher home page."
      subtitle={
        pendingFlow?.verified
          ? "Your reset code has already been accepted."
          : "Please complete the code step first from the forgot-password page."
      }
      actions={
        <>
          <AppLink to="/login" className="text-link">
            Login
          </AppLink>
          <AppLink to="/forgot-password" className="text-link">
            Forgot password
          </AppLink>
        </>
      }
    >
      <div className="auth-panel-stack">
        <form className="form-stack" onSubmit={submit}>
          <Field label="New password">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the password"
            />
          </Field>
          <div className="form-actions">
            <PrimaryButton type="submit">Save password</PrimaryButton>
          </div>
        </form>

        <div className="auth-note">
          <strong>Next step</strong>
          <p>
            You will be redirected to the teacher home page after the password
            is saved.
          </p>
        </div>
      </div>
    </GuestShell>
  );
}
