import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AuthShell } from "../../components/layout/AuthShell.jsx";
import { Field } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/FormInputs.jsx";
import { PrimaryButton } from "../../components/ui/Button.jsx";
import { signUp } from "../../services/auth.js";

export default function RegisterPage() {
  const { navigate, showToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name || !email || !password) {
      showToast("Fill out all registration fields.");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { user, error } = await signUp(email, password, name);

      if (error) {
        showToast(error.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      if (user) {
        showToast(
          "Account created! Check your email to confirm your account, then log in.",
        );
        navigate("/login", { replace: true });
      }
    } catch (err) {
      showToast(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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
        <PrimaryButton type="submit" className="full-width" disabled={loading}>
          <UserPlus size={16} aria-hidden="true" />
          {loading ? "Registering..." : "Register"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
