import React from "react";

const StatsWidget = ({ stats = [] }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ icon, label, value, change, color = "blue", bg = "" }) => {
        const colorMap = {
          blue: "text-blue-600 bg-blue-50",
          emerald: "text-emerald-600 bg-emerald-50",
          amber: "text-amber-600 bg-amber-50",
          purple: "text-purple-600 bg-purple-50",
          rose: "text-rose-600 bg-rose-50",
          indigo: "text-indigo-600 bg-indigo-50",
        };
        const cls = colorMap[color] || colorMap.blue;
        return (
          <div key={label} className={`bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${bg}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${cls}`}>
              {icon}
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1 leading-tight">{value}</div>
            <div className="text-xs text-slate-500 font-semibold mb-2">{label}</div>
            {change !== undefined && (
              <div className={`text-[10px] font-bold ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs last month
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsWidget;
