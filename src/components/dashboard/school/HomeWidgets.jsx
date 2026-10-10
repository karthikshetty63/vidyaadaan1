import { Link } from "react-router-dom";
import { LuArrowRight, LuChevronRight, LuWallet } from "react-icons/lu";
import { formatINR } from "../../../utils/format";

// Building blocks of the school dashboard's home page (the brand-blue design). They only show figures
// they are given, which the page counts from the school's own records: nothing here invents a number.

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

const greetingFor = (date) => {
  const hour = date.getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

/** The welcome banner: who is signed in, the school, a one-line summary, facts and the two main actions. */
export const SchoolHero = ({ userName, schoolName, loading, summary, tile, facts, actions }) => {
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
            {loading && !schoolName ? (
              <Skeleton className="mt-1.5 h-7 w-64 max-w-full" />
            ) : (
              <h1 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight text-brand-navy sm:text-[28px]">{schoolName || "Your school"}</h1>
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

/** A fact on the banner (Verified, UDISE, district…). With `to`, it links somewhere. */
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

const FundingFact = ({ label, value, tone = "text-slate-900", loading }) => (
  <div>
    <dt className="text-xs font-medium text-slate-500">{label}</dt>
    <dd className={`mt-0.5 text-base font-bold tabular-nums sm:text-lg ${tone}`}>{loading ? <Skeleton className="mt-1 h-5 w-20" /> : value}</dd>
  </div>
);

/**
 * The main figure: money raised against the budgets of the school's approved projects. The ring only
 * appears when there is a real goal (at least one approved project); otherwise it says why there isn't.
 * `committed` is what NGOs have promised (null while unknown).
 */
export const FundingCard = ({ loading, failed, raised, goal, committed, committedLoading, paymentsToCheck, className = "" }) => {
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  return (
    <section aria-labelledby="funding-heading" className={`flex flex-col rounded-2xl border border-surface-line bg-surface p-5 shadow-card sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100" aria-hidden="true">
            <LuWallet className="h-5 w-5" />
          </span>
          <div>
            <h2 id="funding-heading" className="text-[15px] font-bold tracking-tight text-slate-900">Funding</h2>
            <p className="text-xs text-slate-500">Across your approved projects</p>
          </div>
        </div>
        <Link to="/dashboard/school/donations" className="group inline-flex items-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium text-primary-700 hover:underline">
          Donation history <LuArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 flex flex-1 items-center gap-6" role="status">
          <span className="sr-only">Loading funding…</span>
          <Skeleton className="h-[136px] w-[136px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ) : failed ? (
        <p className="mt-6 flex-1 text-sm text-slate-500">Funding can&rsquo;t be shown right now. Try reloading the page.</p>
      ) : goal > 0 ? (
        <div className="mt-6 flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Ring percent={percent} />
            <p className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
              <span className="text-3xl font-extrabold tabular-nums text-brand-navy">{percent}%</span>
              <span className="text-xs font-medium text-slate-500">funded</span>
            </p>
            <span className="sr-only">{`${formatINR(raised)} raised of ${formatINR(goal)}, ${percent}% funded.`}</span>
          </div>
          <dl className="grid w-full flex-1 grid-cols-2 gap-x-6 gap-y-4">
            <FundingFact label="Raised" value={formatINR(raised)} tone="text-emerald-700" />
            <FundingFact label="Goal" value={formatINR(goal)} />
            <FundingFact label="Still needed" value={formatINR(Math.max(goal - raised, 0))} />
            {committed !== null && <FundingFact label="Promised by NGOs" value={formatINR(committed)} tone="text-primary-700" loading={committedLoading} />}
          </dl>
        </div>
      ) : (
        <div className="mt-6 flex flex-1 flex-col justify-center rounded-xl bg-surface-muted px-5 py-6 text-center">
          <p className="text-sm font-semibold text-slate-900">No funding goal yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Funding starts once the VIDYADAAN team approves one of your projects. Its budget then becomes your goal here.
          </p>
        </div>
      )}

      {paymentsToCheck > 0 && (
        <Link
          to="/dashboard/school/donations"
          className="group mt-5 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-200 transition-colors hover:bg-amber-100"
        >
          <span>
            <span className="font-semibold">{paymentsToCheck} {paymentsToCheck === 1 ? "payment" : "payments"}</span> from NGOs to check
          </span>
          <LuArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
        </Link>
      )}
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

/** One action on the home page: a box that lifts on hover, with an arrow. */
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

/**
 * Where every project stands, as one bar and a legend. `stages` are [{ key, label, count, color }]; the
 * bar shows the stages that have projects, the legend lists every stage with its count.
 */
export const PipelineBar = ({ stages, total }) => (
  <div>
    <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
      {stages.filter((s) => s.count > 0).map((s) => (
        <span key={s.key} className={`h-full ${s.color}`} style={{ width: `${(s.count / total) * 100}%` }} />
      ))}
    </div>
    {/* Two columns on phones; one flowing row on larger screens. */}
    <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-8">
      {stages.map((s) => (
        <li key={s.key} className="flex items-center gap-2 text-sm sm:whitespace-nowrap">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.color}`} aria-hidden="true" />
          <span className="text-slate-600">{s.label}</span>
          <span className="ml-auto font-bold tabular-nums text-slate-900 sm:ml-1">{s.count}</span>
        </li>
      ))}
    </ul>
  </div>
);
