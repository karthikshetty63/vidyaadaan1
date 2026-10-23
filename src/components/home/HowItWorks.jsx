import { useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight, LuCheck, LuHeart, LuSchool, LuSearch } from "react-icons/lu";
import { formatINR } from "../../utils/format";
import { BAND, CONTAINER, EYEBROW, LEAD, PAGE_TITLE, SECTION_SPACING } from "./styles";

// Who does each step: a small tag with an icon.
const WHO = {
  school: { label: "School", icon: LuSchool, className: "bg-slate-100 text-slate-700" },
  team: { label: "VIDYADAAN team", icon: LuSearch, className: "bg-white text-brand-navy ring-1 ring-inset ring-slate-300" },
  funders: { label: "NGOs and donors", icon: LuHeart, className: "bg-emerald-50 text-emerald-800" },
};

// The workflow as the platform runs it today.
const STEPS = [
  { who: "school", title: "Registers", text: "With its registration certificate, the principal's ID proof and bank details. A person on our team reviews them before the school can sign in." },
  { who: "school", title: "Posts a need", text: "What is needed and why, the budget, the priority and how many students it will help." },
  { who: "team", title: "Reviews the need", text: "Approves it, or sends it back to the school with a reason. Only approved needs are listed." },
  { who: "funders", title: "Fund it", text: "NGOs take one or more of the need's 5 equal parts and pay the school directly. Donors give online." },
  { who: "school", title: "Confirms and updates", text: "Confirms each NGO payment that reached its bank account, and updates the work until it is completed." },
];

// The rules behind "raised", next to the example.
const FUNDING_POINTS = [
  { title: "5 equal parts", text: "Every approved need's budget is split into 5 equal parts, so an NGO can fund one part, several or all five." },
  { title: "Paid straight to the school", text: "The NGO pays the school directly and records the payment with its proof." },
  { title: "Counted once confirmed", text: "The amount counts as raised once the school confirms that the money reached its bank account." },
  { title: "Donors give online", text: "A donation counts once the payment gateway confirms the payment." },
];

// An example only (it says so on screen): one budget in 5 parts, through four stages.
const PART = 20000;
const BUDGET = PART * 5;
const PART_LOOK = {
  received: { label: "Paid, and the school confirmed it", tile: "bg-emerald-600 text-white ring-emerald-600", key: "bg-emerald-600" },
  committed: { label: "Committed by an NGO, payment not confirmed yet", tile: "bg-amber-50 text-amber-900 ring-amber-300", key: "bg-amber-100 ring-1 ring-inset ring-amber-300" },
  open: { label: "Open for an NGO", tile: "bg-white text-slate-500 ring-slate-300", key: "bg-white ring-1 ring-inset ring-slate-300" },
};
const STAGES = [
  {
    label: "Approved",
    parts: ["open", "open", "open", "open", "open"],
    text: "The team approves the need and it is listed. All 5 parts are open for NGOs.",
  },
  {
    label: "Committed",
    parts: ["committed", "committed", "committed", "open", "open"],
    text: "An NGO commits to parts 1 to 3. Nothing counts as raised yet: a commitment is a promise, not a payment.",
  },
  {
    label: "Confirmed",
    parts: ["received", "received", "committed", "open", "open"],
    text: "The NGO pays parts 1 and 2 and records the payments. The school confirms the money reached its bank, so those two parts count as raised.",
  },
  {
    label: "Fully funded",
    parts: ["received", "received", "received", "received", "received"],
    text: "Every part is paid and the school has confirmed each payment. The whole budget counts as raised.",
  },
];

/** The 5-part example: pick a stage, and the parts and the raised amount follow. */
const FundingExample = () => {
  const [stage, setStage] = useState(2);
  const { parts, text } = STAGES[stage];
  const raised = parts.filter((p) => p === "received").length * PART;
  const percent = Math.round((raised / BUDGET) * 100);
  return (
    <figure aria-labelledby="example-caption" className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <figcaption id="example-caption" className="text-sm text-slate-600">
        <span className="font-semibold text-slate-800">Example, not a real need:</span> a {formatINR(BUDGET)} budget in 5 parts of {formatINR(PART)}.
      </figcaption>

      <div role="group" aria-label="Choose a stage" className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            aria-pressed={stage === i}
            onClick={() => setStage(i)}
            className={`whitespace-nowrap rounded-md px-2 py-2 text-sm font-semibold transition-colors ${stage === i ? "bg-white text-brand-navy shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            <span className="tabular-nums text-slate-400">{i + 1}.</span> {s.label}
          </button>
        ))}
      </div>

      <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="The 5 parts">
        {parts.map((state, i) => (
          <li
            key={i}
            className={`flex flex-col items-center rounded-md px-1 py-3 text-center ring-1 ring-inset transition-colors duration-300 motion-reduce:transition-none ${PART_LOOK[state].tile}`}
          >
            <span className="text-xs font-bold">Part {i + 1}</span>
            <span className="mt-0.5 text-[11px] tabular-nums">{formatINR(PART)}</span>
            <span className="mt-1.5 flex h-4 items-center" aria-hidden="true">
              {state === "received" && <LuCheck className="h-4 w-4" />}
              {state === "committed" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
            </span>
            <span className="sr-only">: {PART_LOOK[state].label}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 min-h-[4.5rem] text-[15px] leading-6 text-slate-700" aria-live="polite">{text}</p>

      <div className="mt-2 border-t border-slate-200 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">Counts as raised</p>
          <p className="text-sm text-slate-500">
            <span className="font-heading text-xl font-bold tabular-nums text-brand-navy">{formatINR(raised)}</span> of {formatINR(BUDGET)}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Raised in this example"
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        >
          <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600">
        {Object.entries(PART_LOOK).map(([name, { label, key }]) => (
          <li key={name} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 shrink-0 rounded-sm ${key}`} aria-hidden="true" /> {label}
          </li>
        ))}
      </ul>
    </figure>
  );
};

/** A link to the page to read next. */
const NextLink = ({ to, kicker, title }) => (
  <Link to={to} className="group flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 transition-colors hover:border-slate-400">
    <span>
      <span className="block text-sm text-slate-500">{kicker}</span>
      <span className="mt-0.5 block font-heading text-base font-bold text-brand-navy group-hover:underline group-hover:underline-offset-2">{title}</span>
    </span>
    <LuArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-brand-navy" aria-hidden="true" />
  </Link>
);

/** How VIDYADAAN works: the five steps as a timeline, then how the 5-part funding adds up (an example to try). */
const HowItWorks = () => (
  <>
    <section id="how-it-works" aria-labelledby="how-heading" className="bg-white">
      <div className={`${CONTAINER} ${SECTION_SPACING}`}>
        <p className={EYEBROW}>How it works</p>
        <h1 id="how-heading" className={`mt-2 ${PAGE_TITLE}`}>From a school&rsquo;s request to finished work</h1>
        <p className={LEAD}>Five steps, each one part of the platform today.</p>

        <h2 className="sr-only">The five steps</h2>
        <ol className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
          {STEPS.map(({ who, title, text }, i) => {
            const { label, icon: Icon, className } = WHO[who];
            return (
              <li key={title} className="relative flex gap-4 lg:block">
                {/* The line to the next step: downwards on phones and tablets, across on wide screens. */}
                {i < STEPS.length - 1 && (
                  <span
                    className="absolute -bottom-7 left-5 top-11 w-px bg-slate-300 lg:-right-4 lg:bottom-auto lg:left-12 lg:top-5 lg:h-px lg:w-auto"
                    aria-hidden="true"
                  />
                )}
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy font-heading text-base font-bold text-white" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="min-w-0 pb-1 lg:mt-5">
                  <p className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                  </p>
                  <h3 className="mt-2.5 font-heading text-lg font-bold text-brand-navy">
                    <span className="sr-only">Step {i + 1}: </span>
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-6 text-slate-600">{text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>

    <section aria-labelledby="funding-heading" className={BAND}>
      <div className={`${CONTAINER} ${SECTION_SPACING}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
          <div>
            <h2 id="funding-heading" className="font-heading text-2xl font-bold tracking-tight text-brand-navy sm:text-[1.75rem]">How funding works</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">Try the example: choose a stage to see what counts as raised.</p>
            <ul className="mt-7 space-y-5">
              {FUNDING_POINTS.map(({ title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true">
                    <LuCheck className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-[15px] leading-6 text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <FundingExample />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <NextLink to="/take-part" kicker="Next" title="Ways to take part" />
          <NextLink to="/transparency" kicker="What is public, and what “raised” means" title="Transparency" />
        </div>
      </div>
    </section>
  </>
);

export default HowItWorks;
