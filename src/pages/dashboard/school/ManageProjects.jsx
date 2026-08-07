import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import CreateNeedModal from "../../../components/dashboard/school/CreateNeedModal";
import {
  INITIAL_SCHOOL_PROFILE,
  SCHOOL_PROJECTS_LIST,
  INFRA_16_CATEGORIES,
} from "../../../data/schoolDataStore";

const priorityColors = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

const statusConfig = {
  "In Progress": { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: "🔄" },
  "Completed": { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✅" },
  "Pending": { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: "⏳" },
  "On Hold": { bg: "bg-slate-50 text-slate-600 border-slate-200", icon: "⏸️" },
};

const ManageProjects = () => {
  const navigate = useNavigate();
  const profile = INITIAL_SCHOOL_PROFILE;
  const [projects, setProjects] = useState(SCHOOL_PROJECTS_LIST);
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");

  const handleCreateNeed = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const filtered = projects.filter((p) => {
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (priorityFilter !== "All" && p.priority !== priorityFilter) return false;
    if (searchQ && !p.title.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    critical: projects.filter((p) => p.priority === "Critical").length,
  };

  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden font-sans">
      <Sidebar role="school" userName={profile.principalName} userSub={profile.district} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar role="school" title="Manage Projects" subtitle="All infrastructure projects" />

        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900">Infrastructure Projects</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any project card to view full details, progress photos, and lifecycle.
              </p>
            </div>
            <button
              onClick={() => setIsNeedModalOpen(true)}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              + New Project
            </button>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Projects", value: stats.total, color: "blue", icon: "🏗️" },
              { label: "In Progress", value: stats.inProgress, color: "blue", icon: "🔄" },
              { label: "Completed", value: stats.completed, color: "emerald", icon: "✅" },
              { label: "Critical Priority", value: stats.critical, color: "red", icon: "🔴" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-3 shadow-sm">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className={`text-2xl font-black ${s.color === "emerald" ? "text-emerald-600" : s.color === "red" ? "text-red-600" : "text-blue-600"}`}>
                    {s.value}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex flex-wrap gap-3 items-center shadow-sm">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {INFRA_16_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["All", "In Progress", "Completed", "Pending", "On Hold"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["All", "Critical", "High", "Medium", "Low"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <span className="text-xs font-bold text-slate-400">
              {filtered.length} of {projects.length} projects
            </span>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((proj) => {
              const pct = proj.progress;
              const pc = priorityColors[proj.priority] || priorityColors.Medium;
              const sc = statusConfig[proj.status] || statusConfig["Pending"];
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/project/${proj.id}?role=school`)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col"
                >
                  {/* Hero Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={proj.heroImage}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[9px] font-black uppercase backdrop-blur-md">
                        {proj.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border backdrop-blur-md bg-white/90 ${pc}`}>
                        {proj.priority}
                      </span>
                    </div>

                    {/* Bottom overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-[10px] font-bold text-blue-200">🏫 {proj.location}</p>
                      <p className="text-[9px] text-slate-300">Updated {proj.lastUpdated}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors mb-1">
                        {proj.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{proj.problem}</p>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                      <span>👦 {proj.studentsBenefited}</span>
                      <span>🤝 {proj.ngoPartner?.split(" ")[0]}</span>
                      <span>📅 {proj.expectedCompletion}</span>
                    </div>

                    {/* Budget Progress */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span>₹{proj.raised?.toLocaleString("en-IN")} raised of ₹{proj.budget.toLocaleString("en-IN")}</span>
                        <span className={pct >= 100 ? "text-emerald-600" : "text-blue-600"}>{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-600 to-emerald-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Status + CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${sc.bg}`}>
                        {sc.icon} {proj.status}
                      </span>
                      <button className="px-4 py-1.5 bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white text-[10px] font-extrabold rounded-full transition-all">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20 text-slate-400">
                <div className="text-5xl mb-4">🏗️</div>
                <p className="text-sm font-bold">No projects found matching filters</p>
                <button
                  onClick={() => { setCategoryFilter("All"); setStatusFilter("All"); setPriorityFilter("All"); setSearchQ(""); }}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateNeedModal
        isOpen={isNeedModalOpen}
        onClose={() => setIsNeedModalOpen(false)}
        onCreateNeed={handleCreateNeed}
      />
    </div>
  );
};

export default ManageProjects;
