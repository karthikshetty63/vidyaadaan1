import React from "react";

const TimelineWidget = ({ events = [], title = "Recent Activity" }) => (
  <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6">
    <h3 className="text-base font-extrabold text-slate-900 mb-6">{title}</h3>
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 rounded-full" />
      <div className="space-y-6">
        {events.map((event, i) => (
          <div key={i} className="relative flex items-start gap-4 pl-10">
            {/* Dot */}
            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${event.color || "bg-blue-50"}`}>
              {event.icon || "📌"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-900 leading-snug">{event.title}</p>
                <span className="text-[10px] text-slate-400 font-medium shrink-0 mt-0.5">{event.time}</span>
              </div>
              {event.desc && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.desc}</p>}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-slate-400 pl-10">No recent activity.</p>
        )}
      </div>
    </div>
  </div>
);

export default TimelineWidget;
