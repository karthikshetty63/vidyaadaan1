import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuCheck,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuCreditCard,
  LuEye,
  LuHandCoins,
  LuHourglass,
  LuInfo,
  LuLock,
  LuSearch,
  LuUserCheck,
} from "react-icons/lu";
import ActivityStrip from "./ActivityStrip";
import { BAND, CONTAINER, EYEBROW, H2, LEAD, PAGE_TITLE, SECTION_SPACING } from "./styles";

// What the platform shows, to whom, as the code does it today (public API, portals, private files).
// Each item: [what, optional note].
const AUDIENCES = [
  {
    title: "Public",
    who: "Anyone, without an account",
    icon: LuEye,
    tile: "bg-emerald-50 text-emerald-700",
    mark: LuCheck,
    markClass: "text-emerald-600",
    items: [
      ["Needs the team has approved, each on its own page"],
      ["The school's name, district and state"],
      ["What the school asked for", "Its description, materials, budget estimate, students who will benefit and planned completion"],
      ["The work status the school sets", "Open, In Progress, On Hold or Completed"],
      ["The amount raised and the amount still needed"],
      ["Recent activity, without names or amounts"],
    ],
  },
  {
    title: "Signed-in members",
    who: "Accounts the team has reviewed",
    icon: LuUserCheck,
    tile: "bg-slate-100 text-brand-navy",
    mark: LuCheck,
    markClass: "text-slate-500",
    items: [
      ["NGOs commit to parts of a need", "They pay the school directly and record each payment with its proof"],
      ["Schools accept each recorded payment", "Or reject it with a reason"],
      ["Schools see which NGOs have committed to their needs"],
      ["Donors give online and see their own donations", "With a downloadable report"],
    ],
  },
  {
    title: "Not public",
    who: "Kept private",
    icon: LuLock,
    tile: "bg-brand-navy text-white",
    mark: LuLock,
    markClass: "text-slate-400",
    items: [
      ["A school's bank details", "Only an NGO that has committed to one of its needs and still has parts to pay, and the VIDYADAAN team, see them"],
      ["Registration documents, ID proofs and payment proofs"],
      ["Donors' names", "Schools and visitors see totals, not who gave"],
      ["Contact details, UDISE codes and photos uploaded by schools"],
    ],
  },
];

// The review, as the platform runs it.
const REVIEW_STEPS = [
  { icon: LuHourglass, title: "Submitted, waiting for review", text: "Every new school, NGO and donor account starts as pending. So does every new or resubmitted need." },
  { icon: LuSearch, title: "Checked by a person on our team", text: "They look at the details and the documents that were submitted." },
];
const REVIEW_OUTCOMES = [
  { icon: LuCircleCheck, title: "Approved", text: "The account can be used. A need is listed for NGOs, donors and visitors.", tone: "border-emerald-200 bg-emerald-50 text-emerald-900", iconClass: "text-emerald-600" },
  { icon: LuCircleX, title: "Not approved", text: "The account is rejected. A need is sent back with a reason; the school can fix it and resubmit.", tone: "border-slate-200 bg-white text-slate-800", iconClass: "text-slate-500" },
];

// What adds up to a need's "raised" amount.
const COUNTED = [
  { icon: LuHandCoins, title: "NGO payments", text: "Paid directly to the school. Counted once the school confirms the money reached its bank account." },
  { icon: LuCreditCard, title: "Online donations", text: "Counted once the payment gateway confirms the payment." },
];

const JUMPS = [
  ["#who-sees-what", "Who sees what"],
  ["#review", "How we review"],
  ["#raised", "What “raised” means"],
];

const Operator = ({ children }) => (
  <span className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white font-heading text-lg font-bold text-slate-500" aria-hidden="true">
    {children}
  </span>
);

/**
 * "Transparency": who sees what (public, members, private), how the team's review works (and what it is not),
 * what a need's "raised" amount means, then the recent activity.
 */
const Transparency = () => (
  <>
    <section id="transparency" aria-labelledby="transparency-heading" className="bg-white">
      <div className={`${CONTAINER} ${SECTION_SPACING}`}>
        <p className={EYEBROW}>Transparency</p>
        <h1 id="transparency-heading" className={`mt-2 ${PAGE_TITLE}`}>What is shown, and what it means</h1>
        <p className={LEAD}>VIDYADAAN shows the public what each school asked for and how much money has been confirmed for it. This is exactly what that covers.</p>
        <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
          {JUMPS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              {label}
            </a>
          ))}
        </nav>

        <div id="who-sees-what" className="mt-14 scroll-mt-24">
          <h2 className={H2}>Who sees what</h2>
          <ul className="mt-6 grid gap-5 lg:grid-cols-3">
            {AUDIENCES.map(({ title, who, icon: Icon, tile, mark: Mark, markClass, items }) => (
              <li key={title} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tile}`} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-brand-navy">{title}</h3>
                    <p className="text-sm text-slate-500">{who}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-3.5 border-t border-slate-100 pt-5">
                  {items.map(([text, note]) => (
                    <li key={text} className="flex gap-2.5">
                      <Mark className={`mt-1 h-4 w-4 shrink-0 ${markClass}`} aria-hidden="true" />
                      <div>
                        <p className="text-[15px] leading-6 text-slate-800">{text}</p>
                        {note && <p className="mt-0.5 text-sm leading-5 text-slate-500">{note}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section id="review" aria-labelledby="review-heading" className={`${BAND} scroll-mt-16`}>
      <div className={`${CONTAINER} ${SECTION_SPACING} grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14`}>
        <div>
          <p className={EYEBROW}>Reviews</p>
          <h2 id="review-heading" className={`mt-2 ${H2}`}>Every account and every need is checked by a person</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Nothing is listed automatically. A person on the VIDYADAAN team approves each account before it can be used, and each need before it is listed.
          </p>
          <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <LuInfo className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <p className="text-[15px] leading-6 text-amber-950">
              <span className="font-semibold">What the review is not:</span> it is VIDYADAAN&rsquo;s own check. Documents are not checked against government
              records or by any other outside authority.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <ol className="space-y-6">
            {REVIEW_STEPS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="relative flex gap-4">
                {/* The line down to the next step. */}
                <span className="absolute -bottom-6 left-5 top-11 w-px bg-slate-300" aria-hidden="true" />
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="pt-1">
                  <h3 className="font-heading text-base font-bold text-brand-navy">{title}</h3>
                  <p className="mt-1 text-[15px] leading-6 text-slate-600">{text}</p>
                </div>
              </li>
            ))}
            <li>
              <h3 className="sr-only">The decision</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {REVIEW_OUTCOMES.map(({ icon: Icon, title, text, tone, iconClass }) => (
                  <div key={title} className={`rounded-lg border p-4 ${tone}`}>
                    <p className="flex items-center gap-2 font-semibold">
                      <Icon className={`h-5 w-5 shrink-0 ${iconClass}`} aria-hidden="true" /> {title}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 opacity-90">{text}</p>
                  </div>
                ))}
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section id="raised" aria-labelledby="raised-heading" className="scroll-mt-16 bg-white">
      <div className={`${CONTAINER} ${SECTION_SPACING}`}>
        <p className={EYEBROW}>The numbers</p>
        <h2 id="raised-heading" className={`mt-2 ${H2}`}>What &ldquo;raised&rdquo; means</h2>
        <p className={LEAD}>A need&rsquo;s raised amount adds up two kinds of money, and only once each one is confirmed.</p>

        <div className="mt-8 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-4">
          {COUNTED.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="contents">
              {i > 0 && <Operator>+</Operator>}
              <div className="h-full rounded-lg border border-slate-200 bg-white p-5">
                <Icon className="h-6 w-6 text-slate-500" aria-hidden="true" />
                <h3 className="mt-3 font-heading text-base font-bold text-brand-navy">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            </div>
          ))}
          <Operator>=</Operator>
          <div className="h-full rounded-lg bg-emerald-600 p-5 text-white">
            <LuCircleCheck className="h-6 w-6 text-emerald-100" aria-hidden="true" />
            <h3 className="mt-3 font-heading text-base font-bold">Raised</h3>
            <p className="mt-1 text-sm leading-6 text-emerald-50">The amount shown on every need, next to the amount still needed.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="flex gap-3 rounded-lg border border-dashed border-slate-300 p-4">
            <LuClock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
            <p className="text-[15px] leading-6 text-slate-700">
              <span className="font-semibold text-slate-900">Not counted: money an NGO has only committed.</span> A commitment is a promise; it counts once
              it is paid and the school confirms it.
            </p>
          </div>
          <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <LuInfo className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
            <p className="text-[15px] leading-6 text-slate-700">
              VIDYADAAN can&rsquo;t see schools&rsquo; bank accounts, so an NGO payment counts on the school&rsquo;s confirmation.
            </p>
          </div>
        </div>

        <Link
          to="/how-it-works"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy underline underline-offset-2 hover:decoration-2"
        >
          See it step by step in How it works <LuArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>

    <ActivityStrip />
  </>
);

export default Transparency;
