import { Link } from "react-router-dom";
import { LuArrowRight, LuChevronRight } from "react-icons/lu";

// Building blocks shared by the school, NGO and donor home pages (the brand-blue design). They only show
// the figures they are given, which each page counts from real records: nothing here invents a number.

/** A grey placeholder while a figure loads (still for people who prefer less motion). */
export const Skeleton = ({ className = "" }) => (
  <span className={`block rounded-lg bg-slate-200/70 motion-safe:animate-pulse ${className}`} aria-hidden="true" />
);

// Clickable boxes lift a little on hover; boxes you can't click never move.
export const LIFT =
  "transition-[translate,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0";
// List rows: a soft tint and an arrow that slides in.
export const ROW = "group flex gap-4 px-5 py-4 transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-offset-[-2px]";

export const RowArrow = () => (
  <LuChevronRight
    className="mt-0.5 h-4 w-4 shrink-0 self-center text-slate-300 transition duration-150 group-hover:translate-x-0.5 group-hover:text-primary-600 motion-reduce:group-hover:translate-x-0"
    aria-hidden="true"
  />
);

/** Placeholder rows while a list loads. */
export const RowSkeletons = ({ rows = 3, label }) => (
  <div className="divide-y divide-surface-divider" role="status">
    <span className="sr-only">{label}</span>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex gap-4 px-5 py-4">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const greetingFor = (date) => {
  const hour = date.getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

/** The square tile at the start of a welcome banner. */
export const HeroIconTile = ({ children }) => (
  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-primary-600 ring-1 ring-inset ring-primary-100 sm:h-16 sm:w-16">{children}</span>
);

/**
 * The welcome banner: a greeting for whoever is signed in, the organisation's (or person's) name, a
 * one-line summary, facts in one row and the main actions.
 */
export const PortalHero = ({ userName, title, fallbackTitle = "Welcome", loading, summary, tile, facts, actions }) => {
  const firstName = (userName || "").trim().split(/\s+/)[0];
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-primary-100 bg-linear-to-br from-primary-50 via-white to-white px-5 py-5 shadow-card sm:px-8 sm:py-7">
      {/* Two faint rings: the only decoration. */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full border border-primary-100" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-10 -z-10 h-40 w-40 rounded-full border border-primary-100" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {tile}
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary-700">
              {greetingFor(new Date())}
              {firstName ? `, ${firstName}` : ""}
            </p>
            {loading && !title ? (
              <Skeleton className="mt-1.5 h-7 w-64 max-w-full" />
            ) : (
              <h1 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight text-brand-navy sm:text-[28px]">{title || fallbackTitle}</h1>
            )}
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{summary}</p>
          </div>
        </div>
        {actions && <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">{actions}</div>}
      </div>

      {facts && (
        // One row: it scrolls sideways on phones instead of stacking.
        <ul className="-mx-5 mt-5 flex gap-2 overflow-x-auto border-t border-primary-100/70 px-5 pt-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {facts}
        </ul>
      )}
    </section>
  );
};

/** A fact on the banner (Verified, district…). With `to`, it links somewhere. */
export const HeroFact = ({ icon: Icon, to, children }) => {
  const body = (
    <>
      {Icon && <Icon className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />}
      {children}
    </>
  );
  const cls = "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 text-xs font-medium text-slate-700 ring-1 ring-inset ring-surface-line";
  return (
    <li className="shrink-0">
      {to ? <Link to={to} className={`${cls} transition-colors hover:text-primary-700 hover:ring-primary-200`}>{body}</Link> : <span className={cls}>{body}</span>}
    </li>
  );
};

/** A ring that fills to `percent` (0–100), green once complete. */
const Ring = ({ percent, size = 136, stroke = 12 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-primary-100" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent / 100)}
        strokeLinecap={percent > 0 ? "round" : "butt"}
        className={percent >= 100 ? "text-emerald-500" : "text-primary-600"}
      />
    </svg>
  );
};

const RingFact = ({ label, value, tone = "text-slate-900", loading }) => (
  <div>
    <dt className="text-xs font-medium text-slate-500">{label}</dt>
    <dd className={`mt-0.5 text-base font-bold tabular-nums sm:text-lg ${tone}`}>{loading ? <Skeleton className="mt-1 h-5 w-20" /> : value}</dd>
  </div>
);

/** A link at the bottom of a card for something waiting (amber). */
export const WaitingLink = ({ to, children }) => (
  <Link
    to={to}
    className="group mt-5 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-200 transition-colors hover:bg-amber-100"
  >
    <span>{children}</span>
    <LuArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
  </Link>
);

/**
 * A page's main figure: one amount against its goal, as a ring, with the figures behind it.
 * The ring only appears when there is a real goal (`goal > 0`); otherwise `empty` says why there isn't.
 * `facts`: [{ label, value, tone?, loading? }]. `link`: { to, label }. `footer`: e.g. a <WaitingLink>.
 */
export const RingCard = ({ id, icon: Icon, title, subtitle, link, loading, loadingLabel = "Loading…", failed, failedText, value, goal, centerLabel, srText, facts, empty, footer, className = "" }) => {
  const percent = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <section aria-labelledby={`${id}-heading`} className={`flex flex-col rounded-2xl border border-surface-line bg-surface p-5 shadow-card sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 id={`${id}-heading`} className="text-[15px] font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {link && (
          <Link to={link.to} className="group inline-flex items-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium text-primary-700 hover:underline">
            {link.label} <LuArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="mt-6 flex flex-1 items-center gap-6" role="status">
          <span className="sr-only">{loadingLabel}</span>
          <Skeleton className="h-[136px] w-[136px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ) : failed ? (
        <p className="mt-6 flex-1 text-sm text-slate-500">{failedText}</p>
      ) : goal > 0 ? (
        <div className="mt-6 flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Ring percent={percent} />
            <p className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
              <span className="text-3xl font-extrabold tabular-nums text-brand-navy">{percent}%</span>
              <span className="text-xs font-medium text-slate-500">{centerLabel}</span>
            </p>
            <span className="sr-only">{srText(percent)}</span>
          </div>
          <dl className="grid w-full flex-1 grid-cols-2 gap-x-6 gap-y-4">
            {facts.map((fact) => <RingFact key={fact.label} {...fact} />)}
          </dl>
        </div>
      ) : (
        <div className="mt-6 flex flex-1 flex-col justify-center rounded-xl bg-surface-muted px-5 py-6 text-center">
          <p className="text-sm font-semibold text-slate-900">{empty.title}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{empty.text}</p>
          {empty.action && <div className="mt-4 flex justify-center">{empty.action}</div>}
        </div>
      )}
      {footer}
    </section>
  );
};

// Meaning, not decoration: amber waiting · green approved · red needs you · blue information.
const TONES = {
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  red: "bg-red-50 text-red-600 ring-red-100",
  blue: "bg-primary-50 text-primary-600 ring-primary-100",
};

/** A secondary figure. With `to`, the whole box is a link (and lifts on hover). */
export const MetricCard = ({ label, value, icon: Icon, tone = "blue", hint, loading, to }) => {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset ${TONES[tone]}`} aria-hidden="true">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {to && <LuArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold tabular-nums tracking-tight text-brand-navy">{loading ? <Skeleton className="mt-1 h-7 w-12" /> : value}</p>
      {hint && !loading && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </>
  );
  const cls = "flex h-full flex-col rounded-2xl border border-surface-line bg-surface p-4 shadow-card sm:p-5";
  return to ? (
    <Link to={to} className={`group ${cls} ${LIFT}`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
};

/** One action on a home page: a box that lifts on hover, with an arrow. */
export const QuickActionTile = ({ icon: Icon, label, desc, to, onClick }) => {
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100 transition-colors group-hover:bg-primary-600 group-hover:text-white" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
      </span>
      <LuArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
    </>
  );
  const cls = `group flex h-full w-full items-center gap-3 rounded-2xl border border-surface-line bg-surface p-4 text-left shadow-card ${LIFT}`;
  return to ? <Link to={to} className={cls}>{body}</Link> : <button type="button" onClick={onClick} className={cls}>{body}</button>;
};

/** The six quick actions of a home page, as a grid. `actions`: [{ icon, label, desc, to | onClick }]. */
export const QuickActions = ({ actions }) => (
  <section aria-labelledby="actions-heading">
    <h2 id="actions-heading" className="mb-3 text-[15px] font-bold tracking-tight text-slate-900">Quick actions</h2>
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => (
        <li key={action.label}>
          <QuickActionTile {...action} />
        </li>
      ))}
    </ul>
  </section>
);
