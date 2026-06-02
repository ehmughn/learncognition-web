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
        // Fetch the role to deny access if not allowed
        const { supabase } = await import("../../services/integrations.js");
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const allowedRoles = ["admin", "teacher"];
        if (!profile || !allowedRoles.includes(profile.role)) {
          // Log out immediately if role is not allowed
          const { signOut } = await import("../../services/auth.js");
          await signOut();
          showToast("Log in denied, your account cannot log in here");
          setLoading(false);
          return;
        }

        showToast("Welcome back!");
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
        </div>
        <PrimaryButton type="submit" className="full-width" disabled={loading}>
          <LogIn size={16} aria-hidden="true" />
          {loading ? "Logging in..." : "Log in"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
