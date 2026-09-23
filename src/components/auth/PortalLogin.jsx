import { useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import AuthLayout from "./AuthLayout";
import GoogleSignInModal from "./GoogleSignInModal";
import LoginErrorAlert from "./LoginErrorAlert";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import FormField, { Input } from "../ui/FormField";
import usePortalLogin from "../../hooks/usePortalLogin";

const GoogleMark = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

/**
 * Shared sign-in screen for the School / NGO / Donor / Admin portals.
 * All behaviour (API call, role check, redirects) lives in usePortalLogin.
 */
const PortalLogin = ({
  role,
  image,
  quote,
  portalLabel,
  description,
  identifierLabel = "Email address",
  identifierType = "email",
  identifierPlaceholder = "you@example.com",
  submitLabel = "Sign in",
  register,
  showGoogleDemo = true,
  footerNote,
}) => {
  const { form, setForm, loading, error, correctPortal, handleSubmit } = usePortalLogin(role);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [showResetHelp, setShowResetHelp] = useState(false);

  return (
    <AuthLayout image={image} quote={quote}>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-8">
        <LuArrowLeft className="w-4 h-4" aria-hidden="true" /> All portals
      </Link>

      <p className="text-sm font-medium text-blue-700">{portalLabel}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
      {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}

      <div className="mt-8">
        <LoginErrorAlert error={error} correctPortal={correctPortal} />

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField label={identifierLabel}>
            {(field) => (
              <Input
                {...field}
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
              <Input
                {...field}
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            )}
          </FormField>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600"
              />
              Remember me
            </label>
            <button type="button" onClick={() => setShowResetHelp((v) => !v)} aria-expanded={showResetHelp} className="text-sm font-medium text-blue-700 hover:underline">
              Forgot password?
            </button>
          </div>

          {showResetHelp && (
            <Alert tone="neutral">Self-service password reset isn't available yet. Please contact the VIDYADAAN team to reset your password.</Alert>
          )}

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {loading ? "Signing in…" : submitLabel}
          </Button>
        </form>

        {showGoogleDemo && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-slate-500" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
            </div>
            {/* Google Sign-In — DEMO ONLY, not real authentication (see GoogleSignInModal) */}
            <Button variant="secondary" size="lg" fullWidth onClick={() => setGoogleModalOpen(true)}>
              <span className="inline-flex items-center gap-2"><GoogleMark /> Sign in with Google (Demo)</span>
            </Button>
          </>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 text-sm text-slate-600">
        {register ? (
          <p>
            {register.prompt}{" "}
            <Link to={register.href} className="font-medium text-blue-700 hover:underline">{register.label}</Link>
          </p>
        ) : (
          footerNote
        )}
      </div>

      {showGoogleDemo && <GoogleSignInModal isOpen={googleModalOpen} onClose={() => setGoogleModalOpen(false)} />}
    </AuthLayout>
  );
};

export default PortalLogin;
