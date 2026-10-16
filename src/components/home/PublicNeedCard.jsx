import { Link } from "react-router-dom";
import { LuArrowRight, LuGraduationCap, LuMapPin } from "react-icons/lu";
import { StatusBadge } from "../ui/Badge";
import CategoryIcon from "../ui/CategoryIcon";
import WhatsAppShare from "../ui/WhatsAppShare";
import { formatINR } from "../../utils/format";
import { getFundingPercentage } from "../../utils/funding";
import { AnimatedBar } from "./motion";

/** One open need on the home page: everything on it comes from the public list (the server's figures). */
const PublicNeedCard = ({ need }) => {
  const percent = getFundingPercentage(need.budget, need.raised);
  const place = [need.school.district, need.school.state].filter(Boolean).join(", ");
  return (
    <article className="group flex h-full flex-col rounded-[1.25rem] border border-[#e6edf7] bg-white p-5 shadow-sm transition-[translate,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_28px_-12px_rgb(37_99_235/0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100" aria-hidden="true">
            <CategoryIcon category={need.category} className="h-4 w-4" />
          </span>
          <span className="truncate">{need.category}</span>
        </span>
        {["Critical", "High"].includes(need.priority) && <StatusBadge status={need.priority}>{need.priority} priority</StatusBadge>}
      </div>

      <h3 className="mt-4 font-heading text-lg font-bold leading-snug text-brand-navy">
        <Link to={`/projects/${need.id}`} className="rounded-md transition-colors hover:text-blue-700 focus-visible:outline-offset-2">
          {need.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm font-medium text-slate-700">{need.school.name}</p>
      {place && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <LuMapPin className="h-3.5 w-3.5" aria-hidden="true" /> {place}
        </p>
      )}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{need.summary}</p>

      <div className="mt-auto pt-5">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold tabular-nums text-slate-900">{formatINR(need.raised)} <span className="font-normal text-slate-500">raised</span></span>
          <span className="tabular-nums text-slate-500">of {formatINR(need.budget)}</span>
        </div>
        <AnimatedBar value={percent} label={`${need.title}: ${percent}% funded`} className="mt-2" />
        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <LuGraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> {Number(need.studentsBenefited).toLocaleString("en-IN")} students will benefit
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Link to={`/projects/${need.id}`} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-50 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
            View need <LuArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
          </Link>
          <WhatsAppShare project={need} compact />
        </div>
      </div>
    </article>
  );
};

export default PublicNeedCard;
