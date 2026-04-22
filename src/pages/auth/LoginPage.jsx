import { LogIn } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AuthShell } from "../../components/layout/AuthShell.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton } from "../../components/ui/Button.jsx";
import { AppLink } from "../../components/ui/AppLink.jsx";
import { signIn } from "../../services/auth.js";

export default function LoginPage() {
  const { navigate, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      showToast("Enter an email and password.");
      return;
    }

    setLoading(true);
    try {
      const { session, error } = await signIn(email, password);

      if (error) {
        showToast(error.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      if (session) {
        showToast("Logged in successfully!");
        // Navigation will happen automatically via auth state listener in App.jsx
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      showToast(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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
        <PrimaryButton type="submit" className="full-width" disabled={loading}>
          <LogIn size={16} aria-hidden="true" />
          {loading ? "Logging in..." : "Log in"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
