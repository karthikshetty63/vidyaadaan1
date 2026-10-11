import { useEffect, useState } from "react";
import { LuCircleCheck, LuMailCheck } from "react-icons/lu";
import FormField, { Input } from "../ui/FormField";
import { EMAIL_CODE_LENGTH, EMAIL_CODE_TTL_MINUTES } from "../../../shared/registrationRules.js";

/**
 * Under the email field on a registration form (useRegistrationForm's `emailCode`): what will happen,
 * the box for the emailed code, or that the address is confirmed.
 */
const EmailCodeBox = ({ status, email, message, resendAt, code, setCode, error, busy, resend, verify, useAnotherEmail }) => {
  const [now, setNow] = useState(() => Date.now());
  // The countdown to "send a new code": from the moment the box appears (or a new code is sent), every second.
  useEffect(() => {
    if (status !== "sent") return undefined;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [status, resendAt]);

  if (status === "verified") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
        <LuCircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" /> {email} is confirmed.
      </p>
    );
  }
  if (status !== "sent") {
    return <p className="text-sm text-slate-500">When you continue, we&rsquo;ll email a {EMAIL_CODE_LENGTH}-digit code to this address to confirm it&rsquo;s yours.</p>;
  }

  const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const link = "font-semibold text-blue-700 underline-offset-2 hover:underline disabled:opacity-50";
  return (
    <div role="group" aria-labelledby="email-code-title" className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
      <p id="email-code-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <LuMailCheck className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" /> Confirm your email
      </p>
      <p className="mt-1 text-sm text-slate-600" aria-live="polite">
        {message || `We've sent a ${EMAIL_CODE_LENGTH}-digit code to ${email}.`} The code works for {EMAIL_CODE_TTL_MINUTES} minutes.
      </p>
      <FormField label={`${EMAIL_CODE_LENGTH}-digit code`} error={error} className="mt-3 sm:max-w-56">
        {(f) => (
          <Input
            {...f}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={EMAIL_CODE_LENGTH}
            // The box has just appeared for this one purpose: the cursor goes straight into it.
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                verify();
              }
            }}
            placeholder="••••••"
            className="text-center text-lg font-semibold tracking-[0.4em]"
          />
        )}
      </FormField>
      <p className="mt-3 text-sm text-slate-600">
        Didn&rsquo;t get it? Check your spam folder, or{" "}
        {wait > 0 ? (
          <span className="tabular-nums">send a new code in {wait > 60 ? `${Math.ceil(wait / 60)} min` : `${wait} s`}</span>
        ) : (
          <button type="button" onClick={resend} disabled={busy} className={link}>send a new code</button>
        )}
        . Wrong address?{" "}
        <button type="button" onClick={useAnotherEmail} disabled={busy} className={link}>Use a different email</button>
      </p>
    </div>
  );
};

export default EmailCodeBox;
