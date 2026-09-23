import { Link } from "react-router-dom";
import { LuArrowLeft, LuCircleCheck } from "react-icons/lu";
import FormErrorAlert from "./FormErrorAlert";
import Button from "../ui/Button";
import Stepper from "../ui/Stepper";
import { buttonClasses } from "../ui/classes";
import VidyadaanLogo from "../ui/VidyadaanLogo";

const Shell = ({ label, children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link to="/"><VidyadaanLogo variant="dark" showTagline={false} /></Link>
        <span className="text-sm text-slate-500 truncate">{label}</span>
      </div>
    </header>
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">{children}</div>
    </main>
  </div>
);

/**
 * Multi-step registration frame: stepper, one panel per step, back / continue footer.
 * Field logic and validation live in useRegistrationForm.
 */
const RegistrationLayout = ({ label, steps, step, isLastStep, messages, loading, nextDisabled, nextLabel, onPrev, onNext, loginHref, children }) => (
  <Shell label={label}>
    <Stepper steps={steps} current={step} />

    <section aria-labelledby="registration-step-title" className="bg-white border border-slate-200 rounded-panel shadow-xs">
      <div className="px-5 sm:px-8 pt-6 sm:pt-8">
        <h1 id="registration-step-title" className="text-xl font-semibold tracking-tight text-slate-900">{steps[step]}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {isLastStep ? "Check your details before submitting." : "Fields marked * are required."}
        </p>
      </div>

      <div className="px-5 sm:px-8 py-6 space-y-5">
        {children}
        <FormErrorAlert messages={messages} />
      </div>

      <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-4 border-t border-slate-200 bg-slate-50 rounded-b-panel">
        {step > 0 ? (
          <Button variant="secondary" onClick={onPrev} disabled={loading} icon={LuArrowLeft}>Back</Button>
        ) : (
          <span />
        )}
        <Button onClick={onNext} disabled={nextDisabled} loading={loading}>{nextLabel}</Button>
      </div>
    </section>

    {loginHref && (
      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered? <Link to={loginHref} className="font-medium text-blue-700 hover:underline">Sign in</Link>
      </p>
    )}
  </Shell>
);

/** Final confirmation screen after a successful registration. */
export const RegistrationSuccess = ({ label, title, children, actionHref, actionLabel }) => (
  <Shell label={label}>
    <div className="bg-white border border-slate-200 rounded-panel shadow-xs px-6 sm:px-10 py-10 text-center">
      <span className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
        <LuCircleCheck className="w-6 h-6 text-emerald-600" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <div className="mt-2 text-sm text-slate-600 max-w-md mx-auto">{children}</div>
      <Link to={actionHref} className={buttonClasses({ size: "lg", className: "mt-8" })}>{actionLabel}</Link>
    </div>
  </Shell>
);

/** Read-only list of entered values for the review step. */
export const ReviewSummary = ({ items }) => (
  <dl className="rounded-control border border-slate-200 divide-y divide-slate-200">
    {items.map(([label, value]) => (
      <div key={label} className="grid grid-cols-3 gap-4 px-4 py-2.5 text-sm">
        <dt className="text-slate-500">{label}</dt>
        <dd className="col-span-2 font-medium text-slate-900 break-words">{value || "—"}</dd>
      </div>
    ))}
  </dl>
);

/** Consent checkbox with its own error message. */
export const AgreeCheckbox = ({ checked, onChange, error, children }) => (
  <div>
    <label className="flex items-start gap-3 cursor-pointer text-sm text-slate-600">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-blue-600" aria-invalid={Boolean(error) || undefined} />
      <span>{children}</span>
    </label>
    {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

export default RegistrationLayout;
