import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AuthShell } from "../../components/layout/AuthShell.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton } from "../../components/ui/Button.jsx";
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
    <AuthShell
      title="Create account"
      subtitle="Register your teacher workspace and continue to verification in one step."
      footerLinks={[
        { label: "Log in", to: "/login" },
        { label: "Forgot password", to: "/forgot-password" },
      ]}
      backTo="/"
    >
      <form className="form-stack auth-form" onSubmit={submit}>
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
        <PrimaryButton type="submit" className="full-width">
          <UserPlus size={16} aria-hidden="true" />
          Register
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
