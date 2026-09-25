import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import FormField, { Input } from "../../components/ui/FormField";
import { EMAIL_PATTERN, PASSWORD_RESET_TTL_MINUTES, requestPasswordReset } from "../../api/auth";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=900&auto=format&fit=crop";
const SIGN_IN_PATHS = ["/login/school", "/login/ngo", "/login/donor", "/login/admin"];
// The server sends at most one reset email per account per minute, so a resend is offered after that.
const RESEND_SECONDS = 60;

const TITLE = "mt-1 text-2xl leading-tight font-semibold tracking-[-0.01em] text-balance text-slate-900 outline-none";
const LEAD = "mt-2 text-sm leading-6 text-pretty text-slate-600";
const TEXT_BUTTON = "font-medium text-blue-700 underline-offset-4 hover:underline disabled:opacity-60";

/**
 * PortalLogin passes its look (label, photo, quote) so this page reads as the next step of the
 * portal the user came from. Opened directly, it falls back to a neutral "Account recovery".
 */
const readPortal = (state) => {
  const fromPortal = SIGN_IN_PATHS.includes(state?.signInPath);
  return {
    signInPath: fromPortal ? state.signInPath : "/login",
    label: fromPortal && typeof state.portalLabel === "string" ? state.portalLabel : "Account recovery",
    image: fromPortal && typeof state.image === "string" && state.image.startsWith("https://") ? state.image : DEFAULT_IMAGE,
    quote: fromPortal && typeof state.quote === "string" ? state.quote : undefined,
    isSchool: state?.signInPath === "/login/school",
  };
};

const ForgotPassword = () => {
  const location = useLocation();
  const portal = readPortal(location.state);
  const [email, setEmail] = useState(() => (typeof location.state?.email === "string" ? location.state.email : ""));
  const [sentTo, setSentTo] = useState(""); // address shown on the confirmation screen
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const headingRef = useRef(null);
  const inputRef = useRef(null);

  // Move focus to the confirmation heading so screen readers announce it.
  useEffect(() => {
    if (sentTo) headingRef.current?.focus();
  }, [sentTo]);

  // Tick once a second until "resend" becomes available.
  useEffect(() => {
    if (!sentTo) return undefined;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= resendAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [sentTo, resendAt]);

  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

  const send = async (address) => {
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(address);
      const t = Date.now();
      setNow(t);
      setResendAt(t + RESEND_SECONDS * 1000);
      return true;
    } catch (requestError) {
      if (requestError.errors?.email) setFieldError(requestError.errors.email);
      else setError(requestError.message || "Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    const problem = !value ? "Enter your email address." : EMAIL_PATTERN.test(value) ? "" : "Enter a valid email address.";
    setFieldError(problem);
    setNotice("");
    if (problem) return;
    if (await send(value)) setSentTo(value);
  };

  const resend = async () => {
    setNotice("");
    if (await send(sentTo)) setNotice("We've sent a new link. Only the newest link will work.");
  };

  const changeEmail = () => {
    flushSync(() => {
      setSentTo("");
      setError("");
      setNotice("");
    });
    inputRef.current?.focus();
  };

  return (
    <AuthLayout image={portal.image} quote={portal.quote}>
      <Link to={portal.signInPath} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-8">
        <LuArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to sign in
      </Link>

      <p className="text-sm font-medium text-blue-700">{portal.label}</p>

      {sentTo ? (
        <>
          <h1 ref={headingRef} tabIndex={-1} className={TITLE}>Check your email</h1>
          <p className={LEAD}>
            If an account exists for <span className="font-medium text-slate-900 break-all">{sentTo}</span>, we&apos;ve sent a
            password reset link. It expires in {PASSWORD_RESET_TTL_MINUTES} minutes.
          </p>

          {error && <Alert tone="danger" className="mt-6">{error}</Alert>}
          {notice && <Alert tone="success" className="mt-6">{notice}</Alert>}

          <div className="mt-8 pt-6 border-t border-slate-200 space-y-2 text-sm text-slate-600">
            <p>
              Didn&apos;t get it? Check your spam folder, or{" "}
              {secondsLeft > 0 ? (
                <span className="text-slate-500 tabular-nums whitespace-nowrap">resend in {secondsLeft}s</span>
              ) : (
                <button type="button" onClick={resend} disabled={loading} className={TEXT_BUTTON}>
                  {loading ? "sending…" : "resend the email"}
                </button>
              )}
              .
            </p>
            <p>
              Wrong address?{" "}
              <button type="button" onClick={changeEmail} className={TEXT_BUTTON}>Use a different email</button>
            </p>
          </div>
        </>
      ) : (
        <>
          <h1 className={TITLE}>Forgot your password?</h1>
          <p className={LEAD}>Enter the email associated with your account and we&apos;ll send you a reset link.</p>

          <div className="mt-8">
            {error && <Alert tone="danger" className="mb-5">{error}</Alert>}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <FormField
                label="Email address"
                hint={portal.isSchool ? "Use your school's registered email address. The UDISE code can't be used here." : undefined}
                error={fieldError}
              >
                {(field) => (
                  <Input
                    {...field}
                    ref={inputRef}
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
