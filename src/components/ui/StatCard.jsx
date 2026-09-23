import { LuArrowDownRight, LuArrowUpRight } from "react-icons/lu";

/** Single KPI. `icon` is a react-icons component; `change` is a % vs last month. */
const StatCard = ({ label, value, icon: Icon, change, changeLabel = "vs last month", hint }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {Icon && <Icon className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />}
    </div>
    <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    {change !== undefined && change !== null && (
      <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-emerald-700" : "text-red-700"}`}>
        {change >= 0 ? <LuArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" /> : <LuArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />}
        {Math.abs(change)}% <span className="font-normal text-slate-500">{changeLabel}</span>
      </p>
    )}
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

export default StatCard;
