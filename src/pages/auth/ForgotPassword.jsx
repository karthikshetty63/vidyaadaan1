import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import FormField, { Input } from "../../components/ui/FormField";
import { EMAIL_PATTERN, PASSWORD_RESET_TTL_MINUTES, requestPasswordReset } from "../../api/auth";

// "Back to sign in" returns to the portal the user came from, if any.
const SIGN_IN_PATHS = ["/login/school", "/login/ngo", "/login/donor", "/login/admin"];

const ForgotPassword = () => {
  const location = useLocation();
  const signInPath = SIGN_IN_PATHS.includes(location.state?.signInPath) ? location.state.signInPath : "/login";
  const [email, setEmail] = useState(() => (typeof location.state?.email === "string" ? location.state.email : ""));
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const headingRef = useRef(null);

  // Move focus to the new heading so screen readers announce the confirmation.
  useEffect(() => {
    if (sent) headingRef.current?.focus();
  }, [sent]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    const problem = !value ? "Enter your email address." : EMAIL_PATTERN.test(value) ? "" : "Enter a valid email address.";
    setFieldError(problem);
    setError("");
    if (problem) return;

    setLoading(true);
    try {
      await requestPasswordReset(value);
      setSent(true);
    } catch (requestError) {
      if (requestError.errors?.email) setFieldError(requestError.errors.email);
      else setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout image="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=900&auto=format&fit=crop">
      <Link to={signInPath} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-8">
        <LuArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to sign in
      </Link>

      {sent ? (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight text-slate-900 outline-none">Check your email</h1>
          <p className="mt-2 text-sm text-slate-600">If an account exists for that email, we&apos;ve sent a password reset link.</p>
          <p className="mt-6 text-sm text-slate-500">
            The link expires in {PASSWORD_RESET_TTL_MINUTES} minutes. Didn&apos;t get it? Check your spam folder or{" "}
            <button type="button" onClick={() => setSent(false)} className="font-medium text-blue-700 underline-offset-4 hover:underline">
              try again
            </button>
            .
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot your password?</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the email associated with your account and we&apos;ll send you a reset link.</p>

          <div className="mt-8">
            {error && <Alert tone="danger" className="mb-5">{error}</Alert>}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FormField label="Email address" error={fieldError}>
                {(field) => (
                  <Input
                    {...field}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                )}
              </FormField>
              <Button type="submit" size="lg" fullWidth loading={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
