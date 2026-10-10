import { createElement } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft, LuArrowRight, LuBadgeCheck, LuBuilding2, LuCheck, LuClipboardCheck, LuFileText, LuHeart, LuKeyRound,
  LuLandmark, LuLoaderCircle, LuMapPin, LuSchool, LuShieldCheck, LuSparkles, LuTarget, LuUserRound, LuUsers,
} from "react-icons/lu";
import { AuthBackdrop, Leaves, Swoosh } from "./AuthShell";
import FormErrorAlert from "./FormErrorAlert";
import VidyadaanLogo from "../ui/VidyadaanLogo";

// Each kind of account's colours and words (the sign-in pages use the same colours).
const ROLES = {
  school: {
    icon: LuSchool, title: "Register your school", soft: "bg-blue-50 text-blue-600",
    blurb: "Post what your students need and get support from NGOs and donors.",
    next: "Once approved, create your school's first project from your dashboard.",
  },
  ngo: {
    icon: LuUsers, title: "Register your NGO", soft: "bg-emerald-50 text-emerald-600",
    blurb: "Fund needs in government schools that our team has checked.",
    next: "Once approved, browse school needs and fund the ones you choose.",
  },
  donor: {
    icon: LuHeart, title: "Create a donor account", soft: "bg-violet-50 text-violet-600",
    blurb: "Give to specific, approved needs and follow how each one is funded.",
    next: "Once approved, choose a school need and donate securely.",
  },
};

// An icon for each step, from its name (the three forms name their steps differently).
const STEP_ICONS = [
  [/review/i, LuClipboardCheck], [/document/i, LuFileText], [/bank/i, LuLandmark], [/password/i, LuKeyRound],
  [/address/i, LuMapPin], [/facilit/i, LuBuilding2], [/preference/i, LuHeart], [/mission/i, LuTarget],
  [/registration/i, LuBadgeCheck], [/school/i, LuSchool], [/organisation/i, LuBuilding2], [/principal|contact|personal/i, LuUserRound],
];
const iconForStep = (name) => STEP_ICONS.find(([pattern]) => pattern.test(name))?.[1] || LuSparkles;

// "Step 2 of 6" fills two sixths.
const percentOf = (step, total) => Math.round((Math.min(step + 1, total) / total) * 100);

/** The steps, top to bottom: done ones can be opened again, the current one is highlighted. */
const StepList = ({ steps, step, onGoTo }) => (
  <nav aria-label="Registration progress">
    <ol>
      {steps.map((name, i) => {
        const done = i < step;
        const active = i === step;
        const marker = (
          <span
            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
              done ? "border-blue-600 bg-blue-600 text-white" : active ? "border-blue-600 bg-white text-blue-600 shadow-md shadow-blue-600/20" : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {done ? <LuCheck className="h-4 w-4" aria-hidden="true" /> : createElement(iconForStep(name), { className: "h-4 w-4", "aria-hidden": true })}
          </span>
        );
        const text = (
          <span className="min-w-0 text-left">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
            <span className={`block text-sm ${active ? "font-bold text-slate-900" : done ? "font-medium text-slate-700" : "text-slate-500"}`}>{name}</span>
          </span>
        );
        return (
          <li key={name} className="relative pb-5 last:pb-0">
            {i < steps.length - 1 && <span className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${done ? "bg-blue-600" : "bg-slate-200"}`} aria-hidden="true" />}
            {done && onGoTo ? (
              <button type="button" onClick={() => onGoTo(i)} className="group flex items-center gap-3 rounded-xl pr-2 text-left" title={`Go back to ${name}`}>
                {marker}
                <span className="group-hover:underline group-hover:underline-offset-4">{text}</span>
                <span className="sr-only"> (completed, go back to this step)</span>
              </button>
            ) : (
              <div className="flex items-center gap-3" aria-current={active ? "step" : undefined}>
                {marker}
                {text}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

/** The page around a registration form: the brand side with the steps (large screens) and the card. */
const Shell = ({ role, label, aside, children }) => {
  const theme = ROLES[role];
  const RoleIcon = theme?.icon || LuSparkles;
  return (
    <div className="relative min-h-dvh overflow-clip bg-[#f4f8ff] text-slate-900">
      <AuthBackdrop />
      <div className="relative mx-auto grid min-h-dvh max-w-[90rem] lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
        <aside className="relative hidden flex-col px-10 py-10 lg:sticky lg:top-0 lg:flex lg:h-dvh" aria-label="About this registration">
          <Link to="/" className="w-fit rounded-control" aria-label="VIDYADAAN home">
            <VidyadaanLogo />
          </Link>
          <div className="mt-10 flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme?.soft || "bg-blue-50 text-blue-600"}`} aria-hidden="true">
              <RoleIcon className="h-6 w-6" />
            </span>
            <p className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-brand-navy">{theme?.title || label}</p>
          </div>
          {theme && <p className="mt-3 text-sm leading-relaxed text-slate-600">{theme.blurb}</p>}
          <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:thin]">{aside}</div>
          <div className="relative mt-6 pl-12">
            <p className="handwritten -rotate-6 text-2xl font-semibold leading-tight text-blue-700">Small steps create big changes</p>
            <Swoosh className="-mt-1 w-44 -rotate-6 text-blue-500" />
            <Leaves className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-16 text-blue-400" />
          </div>
        </aside>

        <main className="flex flex-col items-center px-4 py-8 sm:px-8 lg:py-12">
          <Link to="/" className="mb-6 w-fit rounded-control lg:hidden" aria-label="VIDYADAAN home">
            <VidyadaanLogo />
          </Link>
          <div className="w-full max-w-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`overflow-hidden rounded-[1.75rem] border border-white bg-white/95 shadow-[0_24px_60px_-24px_rgb(30_64_175/0.25)] ${className}`}>{children}</div>
);

const PRIMARY = "flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-7 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none";

/**
 * Multi-step registration frame: the step list, one panel per step, back / continue footer.
 * Field logic and validation live in useRegistrationForm.
 */
const RegistrationLayout = ({ role, label, steps, step, isLastStep, messages, loading, nextDisabled, nextLabel, onPrev, onNext, onGoTo, loginHref, children }) => {
  const percent = percentOf(step, steps.length);
  return (
    <Shell role={role} label={label} aside={<StepList steps={steps} step={step} onGoTo={onGoTo} />}>
      <Card>
        <div className="h-1.5 bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-r-full bg-gradient-to-r from-blue-600 to-sky-400 transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
        <section aria-labelledby="registration-step-title" className="px-5 pb-6 pt-7 sm:px-10 sm:pt-9">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600" aria-hidden="true">
              {createElement(iconForStep(steps[step]), { className: "h-6 w-6" })}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {label} · Step {step + 1} of {steps.length}
              </p>
              <h1 id="registration-step-title" className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy">{steps[step]}</h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{isLastStep ? "Check your details before submitting. Choose a finished step on the left to change it." : "Fields marked * are required."}</p>

          {/* Keyed by step, so each step settles in as it opens. */}
          <div key={step} className="auth-form mt-7 space-y-5 motion-safe:animate-view-enter">
            {children}
            <FormErrorAlert messages={messages} />
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-10">
          {step > 0 ? (
            <button type="button" onClick={onPrev} disabled={loading} className="flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:opacity-50">
              <LuArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={onNext} disabled={nextDisabled || loading} className={`group ${PRIMARY}`}>
            {loading ? <LuLoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
            {nextLabel}
            {!loading && <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" aria-hidden="true" />}
          </button>
        </div>
      </Card>

      <div className="mt-6 space-y-2 text-center">
        {loginHref && (
          <p className="text-sm text-slate-600">
            Already registered? <Link to={loginHref} className="font-semibold text-blue-700 hover:underline">Sign in</Link>
          </p>
        )}
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <LuShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
          Your documents and bank details are private. Your progress is kept if you refresh (except passwords, bank details and files).
        </p>
      </div>
    </Shell>
  );
};

/** Final confirmation screen after a successful registration, with what happens next. */
export const RegistrationSuccess = ({ role, label, title, children, actionHref, actionLabel }) => {
  const theme = ROLES[role];
  const next = [
    "Our team checks your details and documents.",
    "We email you when your account is approved. If the email doesn't arrive, check your spam folder or try signing in: the sign-in page says if it's still pending.",
    theme?.next || "Once approved, sign in to your dashboard.",
  ];
  return (
    <Shell
      role={role}
      label={label}
      aside={<p className="rounded-2xl border border-white/80 bg-white/70 p-5 text-sm text-slate-600 shadow-sm">All steps done. Thank you for joining VIDYADAAN!</p>}
    >
      <Card className="px-6 py-10 text-center sm:px-12">
        <div className="relative mx-auto h-24 w-24" aria-hidden="true">
          {/* A ring of coloured dots around the tick. */}
          {["bg-blue-400", "bg-emerald-400", "bg-violet-400", "bg-amber-400", "bg-sky-400", "bg-pink-400"].map((color, i) => (
            <span key={color} className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full ${color}`} style={{ transform: `rotate(${i * 60}deg) translateY(-3rem)` }} />
          ))}
          <span className="absolute inset-3 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 motion-safe:animate-chat-open">
            <LuCheck className="h-9 w-9" strokeWidth={3} />
          </span>
        </div>
        <h1 className="mt-6 font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">{title}</h1>
        <div className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">{children}</div>

        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-slate-50 p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">What happens next</p>
          <ol className="mt-3 space-y-3">
            {next.map((text, i) => (
              <li key={text} className="flex gap-3 text-sm text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
                {text}
              </li>
            ))}
          </ol>
        </div>

        <Link to={actionHref} className={`group mx-auto mt-8 w-fit ${PRIMARY}`}>
          {actionLabel}
          <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </Card>
    </Shell>
  );
};

/** Read-only list of entered values for the review step. */
export const ReviewSummary = ({ items }) => (
  <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <div key={label} className="bg-white px-4 py-3 sm:odd:last:col-span-2">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{value || "—"}</dd>
      </div>
    ))}
  </dl>
);

/** Consent checkbox with its own error message. */
export const AgreeCheckbox = ({ checked, onChange, error, children }) => (
  <div>
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm text-slate-600 transition ${checked ? "border-blue-300 bg-blue-50/60" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600" aria-invalid={Boolean(error) || undefined} />
      <span>{children}</span>
    </label>
    {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

export default RegistrationLayout;
