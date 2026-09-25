import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import FormField, { Input } from "../../components/ui/FormField";
import { buttonClasses } from "../../components/ui/classes";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_RESET_TOKEN_PATTERN,
  PASSWORD_RESET_TTL_MINUTES,
  getPasswordError,
  resetPassword,
} from "../../api/auth";

// Quick feedback only — the server re-checks everything.
const validate = ({ password, confirmPassword }) => {
  const errors = {};
  const passwordError = getPasswordError(password);
  if (passwordError) errors.password = passwordError;
  if (!confirmPassword) errors.confirmPassword = "Confirm your new password.";
  else if (!passwordError && password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
};

const ResetPassword = () => {
  const { token = "" } = useParams();
  // "form" → "done" after a successful reset, or "invalid" for a bad / expired / used link.
  const [status, setStatus] = useState(() => (PASSWORD_RESET_TOKEN_PATTERN.test(token) ? "form" : "invalid"));
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    if (status !== "form") headingRef.current?.focus();
  }, [status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = validate(form);
    setErrors(clientErrors);
    setError("");
    if (Object.keys(clientErrors).length) return;

    setLoading(true);
    try {
      await resetPassword(token, form.password, form.confirmPassword);
      setForm({ password: "", confirmPassword: "" });
      setStatus("done");
    } catch (resetError) {
      if (resetError.code === "INVALID_RESET_TOKEN") setStatus("invalid");
      else if (resetError.errors) setErrors(resetError.errors);
      else setError(resetError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const heading = "mt-1 text-2xl leading-tight font-semibold tracking-[-0.01em] text-balance text-slate-900 outline-none";
  const lead = "mt-2 text-sm leading-6 text-pretty text-slate-600";

  return (
    <AuthLayout image="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=900&auto=format&fit=crop">
      {status !== "done" && (
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-8">
          <LuArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to sign in
        </Link>
      )}

      <p className="text-sm font-medium text-blue-700">Account recovery</p>

      {status === "done" && (
        <>
          <h1 ref={headingRef} tabIndex={-1} className={heading}>Password updated</h1>
          <p className={lead}>Your password has been reset successfully. Sign in with your new password to continue.</p>
          <Link to="/login" className={buttonClasses({ size: "lg", fullWidth: true, className: "mt-8" })}>
            Continue to sign in
          </Link>
        </>
      )}

      {status === "invalid" && (
        <>
          <h1 ref={headingRef} tabIndex={-1} className={heading}>This link is no longer valid</h1>
          <p className={lead}>
            Password reset links expire after {PASSWORD_RESET_TTL_MINUTES} minutes and can only be used once. Request a new link to continue.
          </p>
          <Link to="/forgot-password" className={buttonClasses({ size: "lg", fullWidth: true, className: "mt-8" })}>
            Request a new link
          </Link>
        </>
      )}

      {status === "form" && (
        <>
          <h1 className={heading}>Create a new password</h1>
          <p className={lead}>Choose a new password for your VIDYADAAN account. You&apos;ll use it the next time you sign in.</p>

          <div className="mt-8">
            {error && <Alert tone="danger" className="mb-5">{error}</Alert>}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FormField label="New password" hint={`At least ${PASSWORD_MIN_LENGTH} characters.`} error={errors.password}>
                {(field) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                )}
              </FormField>
              <FormField label="Confirm new password" error={errors.confirmPassword}>
                {(field) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                )}
              </FormField>
              <Button type="submit" size="lg" fullWidth loading={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
