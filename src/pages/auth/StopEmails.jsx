import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LuMailX } from "react-icons/lu";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { buttonClasses } from "../../components/ui/classes";
import { stopNewNeedEmails } from "../../api/notifications";

const TOKEN = /^[0-9a-f]{24}\.[A-Za-z0-9_-]{20,}$/;

/**
 * The "Stop these emails" link in the emails about new school needs. Nothing changes until the person
 * presses the button (email scanners that open links can't stop anyone's emails). No sign-in needed.
 */
const StopEmails = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  // "ask" → "done", or "invalid" for a link that isn't one of ours.
  const [status, setStatus] = useState(() => (TOKEN.test(token) ? "ask" : "invalid"));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    if (status !== "ask") headingRef.current?.focus();
  }, [status]);

  const stop = async () => {
    setBusy(true);
    setError("");
    try {
      await stopNewNeedEmails(token);
      setStatus("done");
    } catch (stopError) {
      if (stopError.status === 400) setStatus("invalid");
      else setError(stopError.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const heading = "mt-1 text-2xl leading-tight font-semibold tracking-[-0.01em] text-balance text-slate-900 outline-none";
  const lead = "mt-2 text-sm leading-6 text-pretty text-slate-600";

  return (
    <AuthLayout>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100" aria-hidden="true">
        <LuMailX className="h-6 w-6" />
      </span>
      <p className="mt-5 text-sm font-medium text-blue-700">Email settings</p>

      {status === "ask" && (
        <>
          <h1 className={heading}>Stop emails about new school needs?</h1>
          <p className={lead}>
            You won&rsquo;t get an email when the VIDYADAAN team approves a new school need. Your account and everything else stay
            the same, and you can turn these emails back on in Settings at any time.
          </p>
          {error && <Alert tone="danger" className="mt-6">{error}</Alert>}
          <Button size="lg" fullWidth className="mt-8" onClick={stop} loading={busy}>
            {busy ? "Stopping…" : "Stop these emails"}
          </Button>
          <Link to="/" className="mt-4 block text-center text-sm text-slate-600 hover:text-slate-900">No, keep them</Link>
        </>
      )}

      {status === "done" && (
        <>
          <h1 ref={headingRef} tabIndex={-1} className={heading}>Done</h1>
          <p className={lead}>
            You won&rsquo;t get emails about new school needs any more. Emails about your own account, such as password reset
            links, still arrive. To turn these back on, sign in and open Settings.
          </p>
          <Link to="/login" className={buttonClasses({ size: "lg", fullWidth: true, className: "mt-8" })}>Go to sign in</Link>
        </>
      )}

      {status === "invalid" && (
        <>
          <h1 ref={headingRef} tabIndex={-1} className={heading}>This link isn&rsquo;t valid</h1>
          <p className={lead}>
            Open the link again from the email, making sure it was copied completely. Or sign in and turn these emails off in
            Settings.
          </p>
          <Link to="/login" className={buttonClasses({ size: "lg", fullWidth: true, className: "mt-8" })}>Go to sign in</Link>
        </>
      )}
    </AuthLayout>
  );
};

export default StopEmails;
