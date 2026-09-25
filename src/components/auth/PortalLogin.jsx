import { Link } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import AuthLayout from "./AuthLayout";
import GoogleSignInButton from "./GoogleSignInButton";
import LoginErrorAlert from "./LoginErrorAlert";
import Button from "../ui/Button";
import FormField, { Input } from "../ui/FormField";
import { EMAIL_PATTERN } from "../../api/auth";
import { GOOGLE_SIGN_IN_ENABLED } from "../../hooks/useGoogleButton";
import usePortalLogin from "../../hooks/usePortalLogin";

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
  showGoogle = true,
  footerNote,
}) => {
  const { form, setForm, loading, googleLoading, error, correctPortal, handleSubmit, handleGoogleCredential } = usePortalLogin(role);

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
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600"
              />
              {/* The shorter wording keeps one row on phones. */}
              <span>Remember me<span className="hidden sm:inline"> for 30 days</span></span>
            </label>
            {/* One reset flow for every portal; it keeps this portal's look and where to come back to. */}
            <Link
              to="/forgot-password"
              state={{
                signInPath: `/login/${role}`,
                portalLabel,
                image,
                quote,
                email: EMAIL_PATTERN.test(form.email.trim()) ? form.email.trim() : "",
              }}
              className="text-sm font-medium text-blue-700 hover:underline whitespace-nowrap"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {loading ? "Signing in…" : submitLabel}
          </Button>
        </form>

        {showGoogle && GOOGLE_SIGN_IN_ENABLED && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-slate-500" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
            </div>
            <GoogleSignInButton onCredential={handleGoogleCredential} busy={googleLoading} />
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
    </AuthLayout>
  );
};

export default PortalLogin;
