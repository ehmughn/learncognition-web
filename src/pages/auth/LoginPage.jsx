import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { GuestShell } from "../../components/layout/GuestShell.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input, Select } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button.jsx";
import { AppLink } from "../../components/ui/AppLink.jsx";
import { makeCode } from "../../utils/formatting.js";

export default function LoginPage() {
  const { navigate, setSession, setPendingFlow, showToast } = useApp();
  const [email, setEmail] = useState("teacher@learncognition.com");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [needsVerification, setNeedsVerification] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      showToast("Enter an email and password.");
      return;
    }

    if (role === "admin" || needsVerification) {
      const code = makeCode();
      setPendingFlow({
        kind: "verify",
        role,
        email,
        code,
        purpose: role === "admin" ? "admin-owner" : "account",
      });
      setSession({
        authenticated: false,
        role,
        name: role === "admin" ? "Admin user" : "Teacher account",
        email,
        verified: false,
      });
      showToast(`Verification code sent to ${email}.`);
      navigate("/verify");
      return;
    }

    setSession({
      authenticated: true,
      role,
      name: "Ari Santos",
      email,
      verified: true,
    });
    setPendingFlow(null);
    navigate("/");
    showToast("Logged in successfully.");
  };

  return (
    <GuestShell
      kicker="Sign in"
      title="Welcome back to LearnCognition."
      subtitle="Teachers and admins can log in from one page. Unverified accounts are routed to email verification before access continues."
      actions={
        <>
          <AppLink to="/" className="text-link">
            Back to landing
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
      <form className="form-stack" onSubmit={submit}>
        <Field label="Account type">
          <Select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
        <Field label="Email address">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@school.edu"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={needsVerification}
            onChange={(event) => setNeedsVerification(event.target.checked)}
          />
          <span>This account still needs verification</span>
        </label>
        <div className="form-actions">
          <PrimaryButton type="submit">Log in</PrimaryButton>
          <SecondaryButton type="button" onClick={() => navigate("/register")}>
            Create account
          </SecondaryButton>
        </div>
      </form>
      <Card className="side-note">
        <p className="eyebrow">What happens next</p>
        <p>
          Admins always receive an owner-verification email. Teachers only route
          to verification when the account is unverified.
        </p>
      </Card>
    </GuestShell>
  );
}
