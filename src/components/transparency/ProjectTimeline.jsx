import React from "react";

const statusConfig = {
  completed: {
    dot: "bg-emerald-500",
    line: "bg-emerald-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeText: "✓ Completed",
    ring: "border-emerald-400",
    iconBg: "bg-emerald-50",
  },
  current: {
    dot: "bg-blue-500 animate-pulse",
    line: "bg-slate-200",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    badgeText: "⏳ In Progress",
    ring: "border-blue-500 shadow-lg shadow-blue-500/20",
    iconBg: "bg-blue-50",
  },
  upcoming: {
    dot: "bg-slate-300",
    line: "bg-slate-200",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
    badgeText: "Pending",
    ring: "border-slate-200",
    iconBg: "bg-slate-50",
  },
};

const ProjectTimeline = ({ stages }) => {
  return (
    <div className="relative">
      <div className="space-y-0">
        {stages.map((stage, idx) => {
          const cfg = statusConfig[stage.status] || statusConfig.upcoming;
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.id} className="flex gap-4 group">
              {/* Left Column — dot + line */}
              <div className="flex flex-col items-center shrink-0 w-10">
                {/* Connector line above */}
                {idx > 0 && (
                  <div className={`w-0.5 h-4 ${statusConfig[stages[idx - 1]?.status || "upcoming"].line}`} />
                )}
                {/* Icon circle */}
                <div
                  className={`w-10 h-10 rounded-2xl border-2 ${cfg.ring} ${cfg.iconBg} flex items-center justify-center text-base shrink-0 transition-all duration-300 group-hover:scale-110`}
                >
                  {stage.icon}
                </div>
                {/* Connector line below */}
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[32px] ${cfg.line}`} />
                )}
              </div>

              {/* Right Column — content */}
              <div className={`pb-6 flex-1 min-w-0 ${isLast ? "" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 pt-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="text-sm font-extrabold text-slate-900">{stage.label}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${cfg.badge}`}
                      >
                        {cfg.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{stage.desc}</p>
                    {stage.verifiedBy && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
                        <span>✓</span> Verified by {stage.verifiedBy}
                      </span>
                    )}
                  </div>
                  {stage.date && (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                      {stage.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTimeline;
