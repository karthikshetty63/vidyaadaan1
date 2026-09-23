import { LuMapPin } from "react-icons/lu";
import Badge, { StatusBadge } from "../ui/Badge";
import Button from "../ui/Button";
import CoverImage from "../ui/CoverImage";
import ProgressBar from "../ui/ProgressBar";

/**
 * A school infrastructure need (used on the NGO and donor dashboards).
 * need: { label, category, schoolName, district, amount, progress, priority, img }
 */
const NeedCard = ({ need, actionLabel, onAction }) => (
  <article className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
    <CoverImage src={need.img} />
    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge>{need.category}</Badge>
        <StatusBadge status={need.priority} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{need.label}</h3>
      <p className="mt-1 text-sm text-slate-600">{need.schoolName}</p>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
        <LuMapPin className="w-3.5 h-3.5" aria-hidden="true" /> {need.district}
      </p>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <span>Target <span className="font-medium text-slate-900">{need.amount}</span></span>
          <span className="font-medium text-slate-900 tabular-nums">{need.progress}% funded</span>
        </div>
        <ProgressBar value={need.progress} label={`${need.label} funding`} />
        <Button className="mt-4" variant="secondary" fullWidth onClick={() => onAction(need)}>{actionLabel}</Button>
      </div>
    </div>
  </article>
);

export default NeedCard;
