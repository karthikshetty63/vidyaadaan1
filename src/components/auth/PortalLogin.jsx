import { useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuArrowLeft, LuArrowRight, LuEye, LuEyeOff, LuHeart, LuLoaderCircle, LuLockKeyhole, LuMail, LuSchool, LuShieldCheck, LuUsers } from "react-icons/lu";
import AuthShell from "./AuthShell";
import GoogleSignInButton from "./GoogleSignInButton";
import LoginErrorAlert from "./LoginErrorAlert";
import FormField from "../ui/FormField";
import { EMAIL_PATTERN } from "../../api/auth";
import { GOOGLE_SIGN_IN_ENABLED } from "../../hooks/useGoogleButton";
import usePortalLogin from "../../hooks/usePortalLogin";

// "Login as": each choice is its own sign-in page (/login/school …), so links and bookmarks keep working.
const PORTALS = [
  { key: "school", label: "School", icon: LuSchool, tint: "text-blue-600" },
  { key: "ngo", label: "NGO", icon: LuUsers, tint: "text-emerald-600" },
  { key: "donor", label: "Donor", icon: LuHeart, tint: "text-violet-600" },
];

const FIELD = "h-12 w-full rounded-xl border bg-white pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";
const fieldBorder = (invalid) => (invalid ? "border-red-400" : "border-slate-200");

/** An input with an icon on its left (and room on the right for a button, when `pr` is given). */
const IconInput = ({ icon: Icon, invalid, className = "pr-3", ...props }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true" />
    <input className={`${FIELD} ${fieldBorder(invalid)} ${className}`} aria-invalid={invalid || undefined} {...props} />
  </div>
);

/**
 * Shared sign-in screen for the School / NGO / Donor / Admin portals.
 * All behaviour (API call, role check, redirects) lives in usePortalLogin.
 */
const PortalLogin = ({
  role,
  portalLabel,
  identifierLabel = "Email address",
  identifierType = "email",
  identifierPlaceholder = "you@example.com",
  register,
  showGoogle = true,
  footerNote,
}) => {
  const location = useLocation();
  const { form, setForm, loading, googleLoading, error, correctPortal, handleSubmit, handleGoogleCredential } = usePortalLogin(role);
  const [showPassword, setShowPassword] = useState(false);
  const portalsLabelId = useId();
  const isAdmin = role === "admin";

  return (
    <AuthShell role={role}>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/60" aria-hidden="true">
          {isAdmin ? <LuShieldCheck className="h-6 w-6" /> : <LuLockKeyhole className="h-6 w-6" />}
        </span>
        <div className="min-w-0">
          {isAdmin && <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{portalLabel}</p>}
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-[1.75rem]">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">{isAdmin ? "Sign in to review registrations and projects." : "Sign in to continue to your dashboard."}</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-8">
          <p id={portalsLabelId} className="text-sm font-semibold text-slate-800">Login as</p>
          <div role="group" aria-labelledby={portalsLabelId} className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
            {PORTALS.map(({ key, label, icon: Icon, tint }) => {
              const active = key === role;
              return (
                <Link
                  key={key}
                  to={`/login/${key}`}
                  replace
                  // Keeps where to go after signing in (for example, back to a project page).
                  state={location.state}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                    active
                      ? "border-transparent bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-600/25"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-white" : tint}`} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        <LoginErrorAlert error={error} correctPortal={correctPortal} />

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField label={identifierLabel}>
            {(field) => (
              <IconInput
                {...field}
                icon={LuMail}
                type={identifierType}
                autoComplete="username"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={identifierPlaceholder}
              />
            )}
          </FormField>

          <FormField label="Password">
            {(field) => (
              <div className="relative">
                <IconInput
                  {...field}
                  icon={LuLockKeyhole}
                  className="pr-12"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label="Show password"
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <LuEyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <LuEye className="h-[18px] w-[18px]" aria-hidden="true" />}
                </button>
              </div>
            )}
          </FormField>

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              {/* The shorter wording keeps one row on phones. */}
              <span>Remember me<span className="hidden sm:inline"> for 30 days</span></span>
            </label>
            {/* One reset flow for every portal; it keeps where to come back to. */}
            <Link
              to="/forgot-password"
              state={{
                signInPath: `/login/${role}`,
                portalLabel,
                email: EMAIL_PATTERN.test(form.email.trim()) ? form.email.trim() : "",
              }}
              className="whitespace-nowrap text-sm font-semibold text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-600 disabled:cursor-wait disabled:opacity-80"
          >
            {loading ? (
              <>
                <LuLoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {showGoogle && GOOGLE_SIGN_IN_ENABLED && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-slate-500" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
            </div>
            <GoogleSignInButton text="continue_with" shape="pill" onCredential={handleGoogleCredential} busy={googleLoading} />
          </>
        )}
      </div>

      <div className="mt-8 space-y-2 text-center text-sm text-slate-600">
        {register && (
          <p>
            {register.prompt}{" "}
            <Link to={register.href} className="font-semibold text-blue-700 hover:underline">{register.label}</Link>
          </p>
        )}
        {footerNote}
        {isAdmin ? (
          <Link to="/login/school" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
            <LuArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> School, NGO or donor sign in
          </Link>
        ) : (
          <p className="text-xs text-slate-500">
            Platform administrator?{" "}
            <Link to="/login/admin" className="font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">Admin sign in</Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
};

export default PortalLogin;
