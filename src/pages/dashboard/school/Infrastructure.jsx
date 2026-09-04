import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import CreateNeedModal from "../../../components/dashboard/school/CreateNeedModal";
import { INFRA_16_CATEGORIES, INFRA_CATEGORY_ICONS } from "../../../constants/infrastructureCategories";
import {
  INITIAL_SCHOOL_PROFILE,
} from "../../../data/schoolDataStore";
import { SCHOOL_PROJECTS_LIST } from "../../../data/projects";

const priorityColors = {
  Critical: { pill: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  High: { pill: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Medium: { pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  Low: { pill: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const Infrastructure = () => {
  const navigate = useNavigate();
  const profile = INITIAL_SCHOOL_PROFILE;
  const [projects, setProjects] = useState(SCHOOL_PROJECTS_LIST);
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const tabFilter = {
    all: projects,
    critical: projects.filter((p) => p.priority === "Critical"),
    "in-progress": projects.filter((p) => p.status === "In Progress"),
    completed: projects.filter((p) => p.status === "Completed"),
  };

  const tabs = [
    { key: "all", label: "All Needs", count: projects.length },
    { key: "critical", label: "🔴 Critical", count: projects.filter((p) => p.priority === "Critical").length },
    { key: "in-progress", label: "🔄 In Progress", count: projects.filter((p) => p.status === "In Progress").length },
    { key: "completed", label: "✅ Completed", count: projects.filter((p) => p.status === "Completed").length },
  ];

  const displayed = tabFilter[activeTab] || projects;

  return (
    <DashboardLayout role="school" userName={profile.principalName} userSub={profile.district} title="Infrastructure Needs" subtitle="School infrastructure management" backgroundClass="bg-[#f8f9fc]">

      <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Infrastructure Needs</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Log, track and manage all government school infrastructure improvement requests.
            </p>
          </div>
          <button
            onClick={() => setIsNeedModalOpen(true)}
            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            + Submit New Need
          </button>
        </div>

        {/* Category Overview Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            Infrastructure Categories — School Coverage
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {INFRA_16_CATEGORIES.map((cat) => {
              const hasProject = projects.some((p) => p.category === cat);
              return (
                <div
                  key={cat}
                  className={`rounded-xl p-3 text-center border transition-all cursor-pointer ${hasProject
                    ? "bg-blue-50 border-blue-200 hover:border-blue-400"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 opacity-60"
                    }`}
                >
                  <div className="text-xl mb-1">{INFRA_CATEGORY_ICONS[cat] || "📦"}</div>
                  <div className="text-[9px] font-bold text-slate-700 leading-tight">{cat}</div>
                  {hasProject && (
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">• Blue = Active need · Grey = No current request</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Infrastructure Needs List — Table-like */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">
              {tabs.find((t) => t.key === activeTab)?.label} ({displayed.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-50">
            {displayed.map((proj) => {
              const pc = priorityColors[proj.priority] || priorityColors.Medium;
              const pct = proj.progress;
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/project/${proj.id}?role=school`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 cursor-pointer group transition-colors"
                >
                  {/* Category Icon */}
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
                    {INFRA_CATEGORY_ICONS[proj.category] || "📦"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {proj.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500 font-semibold">
                      <span>👦 {proj.studentsBenefited} students</span>
                      <span>🤝 {proj.ngoPartner}</span>
                      <span>📅 Due {proj.expectedCompletion}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-28 shrink-0 space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                      <span>Progress</span><span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-emerald-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="text-right shrink-0 w-28">
                    <div className="text-xs font-black text-slate-900">₹{proj.raised?.toLocaleString("en-IN")}</div>
                    <div className="text-[9px] text-slate-400">of ₹{proj.budget.toLocaleString("en-IN")}</div>
                  </div>

                  {/* Priority */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${pc.pill}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${pc.dot} mr-1`} />
                    {proj.priority}
                  </span>

                  {/* Status */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${proj.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    proj.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                    {proj.status}
                  </span>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}

            {displayed.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">🏗️</div>
                <p className="text-sm font-bold">No infrastructure needs in this category</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <CreateNeedModal
        isOpen={isNeedModalOpen}
        onClose={() => setIsNeedModalOpen(false)}
        onCreateNeed={(p) => setProjects([p, ...projects])}
      />
    </DashboardLayout>
  );
};

export default Infrastructure;
