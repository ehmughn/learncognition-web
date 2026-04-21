import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { GuestShell } from "../../components/layout/GuestShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { AppLink } from "../../components/ui/AppLink.jsx";
import { makeCode } from "../../utils/formatting.js";

export default function RegisterPage() {
  const { navigate, setSession, setPendingFlow, showToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!name || !email || !password) {
      showToast("Fill out all registration fields.");
      return;
    }
    const code = makeCode();
    setSession({
      authenticated: false,
      role: "teacher",
      name,
      email,
      verified: false,
    });
    setPendingFlow({
      kind: "verify",
      role: "teacher",
      email,
      code,
      purpose: "registration",
      name,
    });
    showToast(`A verification code was sent to ${email}.`);
    navigate("/verify");
  };

  return (
    <GuestShell
      kicker="Register"
      title="Create a teacher account that is ready for classroom work."
      subtitle="Registration is streamlined for new teachers and ends with an email code so the account can be verified before the home page unlocks."
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
      <form className="form-stack" onSubmit={submit}>
        <Field label="Full name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ari Santos"
          />
        </Field>
        <Field label="Email address">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teacher@school.edu"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Choose a strong password"
          />
        </Field>
        <div className="form-actions">
          <PrimaryButton type="submit">Register</PrimaryButton>
          <SecondaryButton type="button" onClick={() => navigate("/login")}>
            Back to login
          </SecondaryButton>
        </div>
      </form>
      <Card className="side-note">
        <p className="eyebrow">After signup</p>
        <p>
          We simulate an email delivery step and route straight to the
          verification screen so the flow matches a real product.
        </p>
      </Card>
    </GuestShell>
  );
}
