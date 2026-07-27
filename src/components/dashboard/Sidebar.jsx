import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ role = "school", userName = "Admin", userSub = "" }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navs = {
    school: [
      { icon: "🏠", label: "Dashboard", href: "/dashboard/school#overview" },
      { icon: "🎉", label: "School Events", href: "/dashboard/school#events" },
      { icon: "🏫", label: "School Profile", href: "/dashboard/school#profile" },
      { icon: "📋", label: "School Needs", href: "/dashboard/school#needs" },
      { icon: "📦", label: "Projects", href: "/dashboard/school#projects" },
      { icon: "🖼️", label: "Gallery", href: "/dashboard/school#gallery" },
      { icon: "📊", label: "Reports", href: "/dashboard/school#reports" },
      { icon: "⚙️", label: "Settings", href: "/dashboard/school#settings" },
    ],
    ngo: [
      { icon: "🏠", label: "Dashboard", href: "/dashboard/ngo#overview" },
      { icon: "🎉", label: "School Event Requests", href: "/dashboard/ngo#events" },
      { icon: "🏫", label: "Schools Queue", href: "/dashboard/ngo#schools" },
      { icon: "👥", label: "Volunteers", href: "/dashboard/ngo#volunteers" },
      { icon: "💸", label: "Funding", href: "/dashboard/ngo#funding" },
      { icon: "📊", label: "Reports", href: "/dashboard/ngo#reports" },
      { icon: "⚙️", label: "Settings", href: "/dashboard/ngo#settings" },
    ],
    donor: [
      { icon: "🏠", label: "Dashboard", href: "/dashboard/donor#overview" },
      { icon: "📋", label: "Direct School Needs", href: "/dashboard/donor#needs" },
      { icon: "🎉", label: "Support School Events", href: "/dashboard/donor#events" },
      { icon: "📦", label: "Recommended Projects", href: "/dashboard/donor#projects" },
      { icon: "🌱", label: "My Impact", href: "/dashboard/donor#impact" },
      { icon: "💸", label: "My Donations", href: "/dashboard/donor#donations" },
      { icon: "📜", label: "Certificates", href: "/dashboard/donor#certificates" },
      { icon: "⚙️", label: "Settings", href: "/dashboard/donor#settings" },
    ],
  };

  const colorMap = {
    school: { bg: "bg-blue-600", pill: "bg-blue-100 text-blue-700", active: "bg-blue-600 text-white", hover: "hover:bg-blue-50 hover:text-blue-700" },
    ngo: { bg: "bg-emerald-600", pill: "bg-emerald-100 text-emerald-700", active: "bg-emerald-600 text-white", hover: "hover:bg-emerald-50 hover:text-emerald-700" },
    donor: { bg: "bg-amber-500", pill: "bg-amber-100 text-amber-700", active: "bg-amber-500 text-white", hover: "hover:bg-amber-50 hover:text-amber-700" },
  };

  const c = colorMap[role] || colorMap.school;
  const links = navs[role] || navs.school;

  const handleNavClick = (href) => {
    if (href.includes("#")) {
      const id = href.split("#")[1];
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <aside className={`${collapsed ? "w-18" : "w-64"} shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-100 shadow-lg transition-all duration-300 z-20`}>
      {/* Brand */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-5 py-6 border-b border-slate-100`}>
        <Link to="/" className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
            <span className="text-white font-black text-base">V</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-black text-slate-900 text-sm">VIDYADAAN</span>
              <span className="text-[9px] text-emerald-600 font-bold">Empowering Education</span>
            </div>
          )}
        </Link>
        <button onClick={() => setCollapsed(c => !c)} className={`ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${collapsed ? "hidden" : ""}`} title="Collapse">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" /></svg>
        </button>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="mt-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Expand">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M13 5l7 7-7 7M6 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-5 py-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.pill}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {role === "school" ? "School Admin" : role === "ngo" ? "NGO Partner" : "Donor"} Portal
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {links.map(({ icon, label, href }) => {
          const active = location.pathname + location.hash === href || (location.pathname === href && !location.hash);
          return (
            <Link
              key={href}
              to={href}
              onClick={() => handleNavClick(href)}
              className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${active ? c.active : `text-slate-600 ${c.hover}`}`}
            >
              <span className="text-base leading-none shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className={`border-t border-slate-100 px-3 py-4 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        <div className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center text-white font-black text-sm shrink-0`}>
          {userName.charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
            {userSub && <p className="text-[10px] text-slate-500 truncate">{userSub}</p>}
          </div>
        )}
        {!collapsed && (
          <Link to="/" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Logout">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
