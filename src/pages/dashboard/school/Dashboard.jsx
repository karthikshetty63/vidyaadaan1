import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import CreateNeedModal from "../../../components/dashboard/school/CreateNeedModal";
import CreateEventModal from "../../../components/events/CreateEventModal";

import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_SUMMARY_CARDS,
  SCHOOL_PROJECTS_LIST,
  SCHOOL_EVENTS_LIST,
  NOTIFICATIONS_LIST,
  RECENT_DONATIONS,
  NGO_ACTIVITY,
} from "../../../data/schoolDataStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const priorityColors = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

const metricColor = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: "bg-blue-100" },
  red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", icon: "bg-red-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", icon: "bg-amber-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: "bg-emerald-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", icon: "bg-purple-100" },
};

const ngoTypeColor = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  assigned: "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const SectionHeader = ({ label, badge, href, linkText = "View All →" }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h2 className="text-sm font-black text-slate-900">{label}</h2>
      {badge && (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
          {badge}
        </span>
      )}
    </div>
    {href && (
      <Link to={href} className="text-xs font-bold text-blue-600 hover:underline">
        {linkText}
      </Link>
    )}
  </div>
);

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const profile = INITIAL_SCHOOL_PROFILE;
  const recentProjects = SCHOOL_PROJECTS_LIST.slice(0, 3);
  const recentEvents = SCHOOL_EVENTS_LIST.slice(0, 2);
  const unread = NOTIFICATIONS_LIST.filter((n) => !n.read);

  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const quickActions = [
    { icon: "🏗️", label: "New Infrastructure Project", desc: "Create a need request", color: "blue", onClick: () => setIsNeedModalOpen(true) },
    { icon: "🎉", label: "New School Event", desc: "Plan a school event", color: "amber", onClick: () => setIsEventModalOpen(true) },
    { icon: "📈", label: "Upload Progress Photos", desc: "Before / Working / Done", color: "purple", onClick: () => navigate("/dashboard/school/progress") },
    { icon: "👤", label: "Manage School Profile", desc: "Update school details", color: "emerald", onClick: () => navigate("/dashboard/school/profile") },
    { icon: "📄", label: "Generate Reports", desc: "Donation & impact reports", color: "blue", onClick: () => navigate("/dashboard/school/reports") },
    { icon: "📂", label: "All Projects", desc: "View complete project list", color: "slate", onClick: () => navigate("/dashboard/school/projects") },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden font-sans">
      <Sidebar role="school" userName={profile.principalName} userSub={profile.district} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar
          role="school"
          title="Dashboard"
          subtitle={`${profile.name} · ${profile.district}`}
          notifications={unread}
        />

        <main className="flex-1 overflow-y-auto">
          {/* ── HERO BANNER ──────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 px-8 py-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border border-white/30 shadow-lg shrink-0">
                🏫
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">School Admin Portal</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/30 border border-emerald-300/50 text-emerald-100 text-[10px] font-bold">
                    ✓ Verified Government School
                  </span>
                </div>
                <h1 className="text-xl font-black text-white leading-tight">{profile.name}</h1>
                <p className="text-blue-100 text-sm font-medium mt-0.5">
                  UDISE: {profile.udise} · {profile.district}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-white/80 font-semibold">
                  <span>👨‍🎓 {profile.studentsCount} Students</span>
                  <span>👩‍🏫 {profile.teachersCount} Teachers</span>
                  <span>📅 Est. {profile.established}</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2 shrink-0">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center">
                <div className="text-2xl font-black text-white">{profile.developmentScore}%</div>
                <div className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Dev Score</div>
              </div>
              <button
                onClick={() => navigate("/dashboard/school/profile")}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold rounded-full transition-all"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>

          <div className="px-8 py-6 space-y-8">

            {/* ── SUMMARY METRIC CARDS ────────────────────────────────────── */}
            <section>
              <SectionHeader label="Overview Metrics" />
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
                {INITIAL_SUMMARY_CARDS.map((card) => {
                  const c = metricColor[card.color] || metricColor.blue;
                  return (
                    <div
                      key={card.id}
                      className={`bg-white rounded-2xl border ${c.border} px-4 py-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${c.icon} flex items-center justify-center text-base`}>
                        {card.icon}
                      </div>
                      <div>
                        <div className={`text-xl font-black ${c.text}`}>{card.value}</div>
                        <div className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">{card.label}</div>
                      </div>
                      {card.change > 0 && (
                        <div className={`text-[10px] font-bold ${c.text} opacity-70`}>+{card.change} this month</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── QUICK ACTIONS ───────────────────────────────────────────── */}
            <section>
              <SectionHeader label="Quick Actions" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={qa.onClick}
                    className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl px-4 py-4 text-left flex flex-col gap-2 transition-all group"
                  >
                    <span className="text-2xl">{qa.icon}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {qa.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{qa.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* ── RECENT PROJECTS + NOTIFICATIONS SPLIT ─────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* LEFT — Recent Infrastructure Projects */}
              <div className="xl:col-span-2 space-y-4">
                <SectionHeader
                  label="Recent Infrastructure Projects"
                  badge={`${SCHOOL_PROJECTS_LIST.length} Total`}
                  href="/dashboard/school/projects"
                />
                <div className="space-y-3">
                  {recentProjects.map((proj) => {
                    const pct = proj.progress;
                    const pc = priorityColors[proj.priority] || priorityColors.Medium;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => navigate(`/project/${proj.id}?role=school`)}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            <img src={proj.heroImage} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
                                {proj.title}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${pc}`}>
                                {proj.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{proj.problem}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                              <span>🏗️ {proj.category}</span>
                              <span>👦 {proj.studentsBenefited} students</span>
                              <span>🤝 {proj.ngoPartner}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                <span>₹{proj.raised?.toLocaleString("en-IN")} raised</span>
                                <span className={pct >= 100 ? "text-emerald-600" : "text-blue-600"}>{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-600 to-emerald-400"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 pb-3 flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            proj.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            proj.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {proj.status === "Completed" ? "✅" : proj.status === "In Progress" ? "🔄" : "⏳"} {proj.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Updated {proj.lastUpdated}</span>
                        </div>
                      </div>
                    );
                  })}
                  <Link
                    to="/dashboard/school/projects"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                  >
                    + View All {SCHOOL_PROJECTS_LIST.length} Projects
                  </Link>
                </div>
              </div>

              {/* RIGHT — Notifications */}
              <div className="space-y-4">
                <SectionHeader
                  label="Notifications"
                  badge={`${unread.length} unread`}
                  href="/dashboard/school/notifications"
                />
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {NOTIFICATIONS_LIST.map((notif, i) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50/70 transition-colors ${
                        i < NOTIFICATIONS_LIST.length - 1 ? "border-b border-slate-50" : ""
                      } ${!notif.read ? "bg-blue-50/30" : ""}`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-extrabold leading-snug ${!notif.read ? "text-slate-900" : "text-slate-600"}`}>
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{notif.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <Link to="/dashboard/school/notifications" className="text-xs font-bold text-blue-600 hover:underline">
                      View all notifications →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RECENT SCHOOL EVENTS ──────────────────────────────────── */}
            <section>
              <SectionHeader
                label="Recent School Events"
                badge={`${SCHOOL_EVENTS_LIST.length} Events`}
                href="/dashboard/school/events"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentEvents.map((evt) => {
                  const pct = Math.round((evt.raisedAmount / evt.requiredBudget) * 100);
                  return (
                    <div
                      key={evt.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                      onClick={() => navigate("/dashboard/school/events")}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[9px] font-black backdrop-blur-md">
                            🎉 {evt.category}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[9px] font-bold ${
                            evt.status === "Fully Sponsored"
                              ? "bg-emerald-500/90 text-white"
                              : "bg-white/90 text-slate-800"
                          }`}>
                            {evt.status}
                          </span>
                        </div>
                        <p className="absolute bottom-2 left-3 text-white font-extrabold text-sm">{evt.title}</p>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                          <span>📅 {evt.date}</span>
                          <span>👦 {evt.requiredItems?.length} items needed</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>₹{evt.raisedAmount?.toLocaleString("en-IN")} raised</span>
                            <span>Goal ₹{evt.requiredBudget?.toLocaleString("en-IN")} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── DONATIONS + NGO ACTIVITY ─────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Latest Donations */}
              <div>
                <SectionHeader
                  label="Latest Donations"
                  badge="Live"
                  href="/dashboard/school/donations"
                />
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-50">
                    {RECENT_DONATIONS.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {d.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-slate-900">{d.donor}</p>
                          <p className="text-[10px] text-slate-500 truncate">{d.purpose}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-emerald-600">₹{d.amount.toLocaleString("en-IN")}</div>
                          <div className="text-[10px] text-slate-400">{d.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Total this month: <span className="text-emerald-600">₹67,500</span></span>
                    <Link to="/dashboard/school/donations" className="text-xs font-bold text-blue-600 hover:underline">View all →</Link>
                  </div>
                </div>
              </div>

              {/* NGO Activity */}
              <div>
                <SectionHeader label="Latest NGO Activity" />
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-50">
                    {NGO_ACTIVITY.map((a) => {
                      const tc = ngoTypeColor[a.type] || ngoTypeColor.review;
                      return (
                        <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border ${tc}`}>
                            {a.type === "verified" ? "✅" : a.type === "assigned" ? "👥" : "📋"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-slate-900">{a.ngo}</p>
                            <p className="text-[10px] text-slate-500">{a.action}</p>
                            <p className="text-[10px] text-blue-600 font-bold truncate">📦 {a.project}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{a.time}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">3 NGO partners actively supporting your school</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Spacer */}
            <div className="h-8" />
          </div>
        </main>
      </div>

      {/* Modals launched only from Quick Actions */}
      <CreateNeedModal
        isOpen={isNeedModalOpen}
        onClose={() => setIsNeedModalOpen(false)}
        onCreateNeed={() => {}}
      />
      <CreateEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onCreateEvent={() => {}}
      />
    </div>
  );
};

export default Dashboard;
