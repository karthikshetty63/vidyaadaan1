import { useState } from "react";
import { Link } from "react-router-dom";
import { LuCircleCheck, LuFolderKanban, LuPlus, LuSearch, LuTrendingUp, LuTriangleAlert } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import CreateNeedModal from "../../../components/dashboard/school/CreateNeedModal";
import Badge, { StatusBadge } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import CoverImage from "../../../components/ui/CoverImage";
import EmptyState from "../../../components/ui/EmptyState";
import { Input, Select } from "../../../components/ui/FormField";
import PageHeader from "../../../components/ui/PageHeader";
import ProgressBar from "../../../components/ui/ProgressBar";
import StatCard from "../../../components/ui/StatCard";
import { INFRA_16_CATEGORIES } from "../../../constants/infrastructureCategories";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";
import { SCHOOL_PROJECTS_LIST } from "../../../data/projects";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const ManageProjects = () => {
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

  const clearFilters = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");
    setSearchQ("");
  };

  return (
    <DashboardLayout role="school" userName={profile.principalName} userSub={profile.district} title="Manage projects" subtitle="All infrastructure projects">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            title="Infrastructure projects"
            description="Open a project to see its details, progress photos and lifecycle."
            actions={<Button icon={LuPlus} onClick={() => setIsNeedModalOpen(true)}>New project</Button>}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Total projects" value={stats.total} icon={LuFolderKanban} />
            <StatCard label="In progress" value={stats.inProgress} icon={LuTrendingUp} />
            <StatCard label="Completed" value={stats.completed} icon={LuCircleCheck} />
            <StatCard label="Critical priority" value={stats.critical} icon={LuTriangleAlert} />
          </div>

          <Card className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
              <Input type="search" aria-label="Search projects" placeholder="Search projects…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="pl-9" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-auto">
              <Select aria-label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="lg:w-44">
                <option value="All">All categories</option>
                {INFRA_16_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="lg:w-40">
                {["All", "In Progress", "Completed", "Pending", "On Hold"].map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
                ))}
              </Select>
              <Select aria-label="Priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="lg:w-40">
                {["All", "Critical", "High", "Medium", "Low"].map((p) => (
                  <option key={p} value={p}>{p === "All" ? "All priorities" : p}</option>
                ))}
              </Select>
            </div>
            <p className="text-sm text-slate-500 whitespace-nowrap" aria-live="polite">
              {filtered.length} of {projects.length} projects
            </p>
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                title="No projects match these filters"
                action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/project/${proj.id}?role=school`}
                  className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-colors hover:border-slate-300"
                >
                  <CoverImage src={proj.heroImage} />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge>{proj.category}</Badge>
                      <StatusBadge status={proj.status} />
                      <StatusBadge status={proj.priority} />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900">{proj.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{proj.problem}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {proj.studentsBenefited} students · {proj.ngoPartner} · Due {proj.expectedCompletion}
                    </p>
                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                        <span><span className="font-medium text-slate-900">{formatINR(proj.raised)}</span> of {formatINR(proj.budget)}</span>
                        <span className="font-medium text-slate-900 tabular-nums">{proj.progress}%</span>
                      </div>
                      <ProgressBar value={proj.progress} label={`${proj.title} funding`} />
                      <p className="mt-3 text-xs text-slate-500">{proj.location} · Updated {proj.lastUpdated}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <CreateNeedModal
        isOpen={isNeedModalOpen}
        onClose={() => setIsNeedModalOpen(false)}
        onCreateNeed={handleCreateNeed}
      />
    </DashboardLayout>
  );
};

export default ManageProjects;
