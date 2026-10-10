import { useState } from "react";
import { Link } from "react-router-dom";
import { LuKeyRound, LuLogOut, LuPencil } from "react-icons/lu";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Card, { CardHeader } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import { buttonClasses } from "../../ui/classes";
import { requestPasswordReset } from "../../../api/auth";
import { useAuth } from "../../../context/AuthContext";
import { PASSWORD_RESET_TTL_MINUTES } from "../../../../shared/registrationRules.js";

/**
 * Account settings for the NGO and donor portals: who is signed in, and changing the password with
 * the same emailed-link flow as "Forgot password?" (so every other device is signed out).
 * `accountType` is shown as is ("NGO" or "Donor").
 */
const AccountSettingsView = ({ accountType, onSignOut, signingOut }) => {
  const { user } = useAuth();
  const [reset, setReset] = useState({ busy: false, sent: false, error: "" });

  const sendResetLink = async () => {
    setReset({ busy: true, sent: false, error: "" });
    try {
      await requestPasswordReset(user.email);
      setReset({ busy: false, sent: true, error: "" });
    } catch (err) {
      setReset({ busy: false, sent: false, error: err.message || "Could not send the email. Please try again." });
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Your sign-in details and password." />
      <Card>
        <CardHeader title="Account" />
        <dl className="divide-y divide-surface-divider">
          {[["Name", user?.name], ["Sign-in email", user?.email], ["Account type", accountType]].map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 gap-1 px-5 py-3 text-sm sm:grid-cols-3 sm:gap-4">
              <dt className="text-slate-500">{label}</dt>
              <dd className="break-words font-medium text-slate-900 sm:col-span-2">{value || "—"}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col justify-between gap-3 border-t border-surface-divider px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">Your contact details are edited on your profile. Your sign-in email can&rsquo;t be changed here.</p>
          <Link to="#profile" className={buttonClasses({ variant: "secondary", size: "sm", className: "shrink-0" })}>
            <LuPencil className="h-3.5 w-3.5" aria-hidden="true" /> Open profile
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader title="Password" />
        <div className="space-y-4 p-5">
          <p className="text-sm text-slate-600">
            To change your password, we&rsquo;ll email you a secure link. It works for {PASSWORD_RESET_TTL_MINUTES} minutes, and setting a new
            password signs you out on every other device.
          </p>
          {reset.sent && (
            <Alert tone="success" title="Check your email">
              We&rsquo;ve sent a link to {user?.email}. If it doesn&rsquo;t arrive in a few minutes, check your spam folder.
            </Alert>
          )}
          {reset.error && <Alert tone="danger">{reset.error}</Alert>}
          <Button variant="secondary" icon={LuKeyRound} onClick={sendResetLink} loading={reset.busy} disabled={!user?.email}>
            {reset.busy ? "Sending…" : reset.sent ? "Send the link again" : "Email me a reset link"}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Sign out" />
        <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">Sign out on this device. On a shared computer, always sign out when you finish.</p>
          <Button variant="secondary" icon={LuLogOut} onClick={onSignOut} loading={signingOut} className="shrink-0">Sign out</Button>
        </div>
      </Card>
    </>
  );
};

export default AccountSettingsView;
