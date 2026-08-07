import React from "react";

const colorStyles = {
  blue: {
    iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  purple: {
    iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  red: {
    iconBg: "bg-red-50 text-red-600 border-red-100",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

const SaaSMetricCard = ({ icon, label, value, change, color = "blue" }) => {
  const c = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-white rounded-[20px] border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl border ${c.iconBg} flex items-center justify-center text-lg font-black shrink-0 transition-transform group-hover:scale-105`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${c.badge}`}>
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
        )}
      </div>

      <div>
        <span className="text-[11px] font-bold text-slate-400 block tracking-tight mb-0.5">{label}</span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default SaaSMetricCard;
