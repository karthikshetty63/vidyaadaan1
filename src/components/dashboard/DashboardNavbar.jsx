import React from "react";

const colorMap = {
  school: { accent: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  ngo: { accent: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  donor: { accent: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200" },
};

const DashboardNavbar = ({
  role = "school",
  title = "Dashboard",
  subtitle = "",
  notifications = [],
}) => {
  const c = colorMap[role] || colorMap.school;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
      {/* Breadcrumb / Title */}
      <div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">
          <span>VIDYADAAN</span>
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>
          <span className={c.accent}>{title}</span>
        </div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          )}
        </div>

        {/* Role Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${c.badge}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {role === "school" ? "School" : role === "ngo" ? "NGO" : "Donor"} Portal
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
