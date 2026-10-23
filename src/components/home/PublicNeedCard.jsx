import { Link } from "react-router-dom";
import { LuArrowRight, LuGraduationCap, LuMapPin, LuSchool } from "react-icons/lu";
import CategoryIcon from "../ui/CategoryIcon";
import WhatsAppShare from "../ui/WhatsAppShare";
import { formatINR } from "../../utils/format";
import { getAmountRemaining, getFundingPercentage } from "../../utils/funding";

// Priority is the school's own choice; only the two urgent levels get a tag.
const PRIORITY_TAG = {
  Critical: "bg-red-50 text-red-700 ring-red-200",
  High: "bg-amber-50 text-amber-800 ring-amber-200",
};
// The work status the school sets. "Open" is the usual state, so only the others are pointed out.
const STATUS_TAG = { "In Progress": "Work in progress", "On Hold": "On hold" };
const TAG = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";

/**
 * One open need as a card (home page and School needs page): what it is, whose it is, how much is still
 * needed (the server's figures) and what to do. `titleAs`: the title's heading level.
 */
const PublicNeedCard = ({ need, titleAs: Title = "h3" }) => {
  const percent = getFundingPercentage(need.budget, need.raised);
  const remaining = getAmountRemaining(need.budget, need.raised);
  const place = [need.school.district, need.school.state].filter(Boolean).join(", ");
  const priority = PRIORITY_TAG[need.priority];
  const status = STATUS_TAG[need.status];
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white transition-[border-color,box-shadow,translate] duration-300 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-900/5 motion-safe:hover:-translate-y-1">
      <p className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3 text-sm font-medium text-slate-700">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700" aria-hidden="true">
          <CategoryIcon category={need.category} className="h-4 w-4" />
        </span>
        {need.category}
      </p>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {(priority || status) && (
          <p className="mb-2 flex flex-wrap gap-1.5">
            {priority && (
              <span className={`${TAG} ${priority}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                {need.priority} priority
              </span>
            )}
            {status && <span className={`${TAG} bg-slate-50 text-slate-700 ring-slate-200`}>{status}</span>}
          </p>
        )}
        {/* The first letter is capitalised on screen only; the school's own text is shown as written. */}
        <Title className="font-heading text-lg font-bold leading-snug text-brand-navy first-letter:uppercase">
          <Link to={`/projects/${need.id}`} className="underline-offset-2 hover:text-brand-navy hover:underline">
            {need.title}
          </Link>
        </Title>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-700">
          <LuSchool className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{need.school.name}</span>
        </p>
        {place && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <LuMapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /> {place}
          </p>
        )}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 first-letter:uppercase">{need.summary}</p>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Still needed</p>
              <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-brand-navy">{formatINR(remaining)}</p>
            </div>
            <p className="text-right text-sm leading-5 text-slate-500">
              <span className="font-semibold tabular-nums text-slate-800">{formatINR(need.raised)}</span> raised
              <br />
              of {formatINR(need.budget)}
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${need.title}: ${percent}% funded`}
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
          >
            {/* Fills up once the card has arrived (ui-bar-fill; still for people who ask for less motion). */}
            <div className="ui-bar-fill h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
            <LuGraduationCap className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            {Number(need.studentsBenefited).toLocaleString("en-IN")} students will benefit
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
        <Link
          to={`/projects/${need.id}`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-brand-navy text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          View need <LuArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <WhatsAppShare project={need} compact />
      </div>
    </article>
  );
};

/** A grey placeholder of the card's shape, while needs load. */
export const NeedCardSkeleton = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-5" aria-hidden="true">
    {["h-8 w-40", "mt-5 h-6 w-3/4", "mt-3 h-4 w-1/2", "mt-4 h-10 w-full", "mt-8 h-7 w-1/3", "mt-3 h-2 w-full", "mt-6 h-10 w-full"].map((c) => (
      <span key={c} className={`ui-skeleton block rounded bg-slate-200/70 ${c}`} />
    ))}
  </div>
);

export default PublicNeedCard;
