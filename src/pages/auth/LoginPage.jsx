import { LogIn } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AuthShell } from "../../components/layout/AuthShell.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton } from "../../components/ui/Button.jsx";
import { AppLink } from "../../components/ui/AppLink.jsx";

export default function LoginPage() {
  const { navigate, setSession, setPendingFlow, showToast } = useApp();
  const [email, setEmail] = useState("teacher@learncognition.com");
  const [password, setPassword] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      showToast("Enter an email and password.");
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const requiresVerification =
      normalizedEmail.includes("admin") || normalizedEmail.includes("verify");

    if (requiresVerification) {
      setPendingFlow({
        kind: "verify",
        role: normalizedEmail.includes("admin") ? "admin" : "teacher",
        email,
        code: "4821936507",
        purpose: normalizedEmail.includes("admin") ? "admin-owner" : "account",
      });
      setSession({
        authenticated: false,
        role: normalizedEmail.includes("admin") ? "admin" : "teacher",
        name: normalizedEmail.includes("admin")
          ? "Admin user"
          : "Teacher account",
        email,
        verified: false,
      });
      showToast(`Verification code sent to ${email}.`);
      navigate("/verify");
      return;
    }

    setSession({
      authenticated: true,
      role: "teacher",
      name: "Ari Santos",
      email,
      verified: true,
    });
    setPendingFlow(null);
    navigate("/");
    showToast("Logged in successfully.");
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Access your teacher dashboard and manage modules from one clean workspace."
      footerLinks={[
        { label: "Register", to: "/register" },
        { label: "Forgot password", to: "/forgot-password" },
      ]}
      backTo="/"
    >
      <form className="form-stack auth-form" onSubmit={submit}>
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
            placeholder="Enter your password"
          />
        </Field>
        <div className="auth-meta-row">
          <label className="checkbox-row auth-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Remember me</span>
          </label>
          <AppLink to="/forgot-password" className="text-link">
            Forgot password?
          </AppLink>
        </div>
        <PrimaryButton type="submit" className="full-width">
          <LogIn size={16} aria-hidden="true" />
          Log in
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
