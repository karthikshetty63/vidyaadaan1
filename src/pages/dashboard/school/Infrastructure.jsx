import { useState } from "react";
import { Link } from "react-router-dom";
import { LuChevronRight, LuPlus } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import CreateNeedModal from "../../../components/dashboard/school/CreateNeedModal";
import { StatusBadge } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card, { CardHeader } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import ProgressBar from "../../../components/ui/ProgressBar";
import SegmentedControl from "../../../components/ui/SegmentedControl";
import { INFRA_16_CATEGORIES, INFRA_CATEGORY_ICONS } from "../../../constants/infrastructureCategories";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";
import { SCHOOL_PROJECTS_LIST } from "../../../data/projects";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Infrastructure = () => {
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
    { value: "all", label: "All", count: projects.length },
    { value: "critical", label: "Critical", count: tabFilter.critical.length },
    { value: "in-progress", label: "In progress", count: tabFilter["in-progress"].length },
    { value: "completed", label: "Completed", count: tabFilter.completed.length },
  ];

  const displayed = tabFilter[activeTab] || projects;

  return (
    <DashboardLayout role="school" userName={profile.principalName} userSub={profile.district} title="Infrastructure needs" subtitle="School infrastructure management">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            title="Infrastructure needs"
            description="Log, track and manage your school's infrastructure improvement requests."
            actions={<Button icon={LuPlus} onClick={() => setIsNeedModalOpen(true)}>Submit new need</Button>}
          />

          <Card>
            <CardHeader title="Category coverage" description="Categories with an active request are highlighted." />
            <ul className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-5">
              {INFRA_16_CATEGORIES.map((cat) => {
                const hasProject = projects.some((p) => p.category === cat);
                return (
                  <li
                    key={cat}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm ${
                      hasProject ? "border-blue-200 bg-blue-50 text-blue-800 font-medium" : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    <span aria-hidden="true">{INFRA_CATEGORY_ICONS[cat] || "📦"}</span>
                    <span className="min-w-0 truncate" title={cat}>{cat}</span>
                    {hasProject && <span className="sr-only">(active request)</span>}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Requests</h2>
              <SegmentedControl label="Filter requests" value={activeTab} onChange={setActiveTab} options={tabs} />
            </div>

            {displayed.length === 0 ? (
              <EmptyState title="No infrastructure needs in this view" />
            ) : (
              <ul className="divide-y divide-slate-200">
                {displayed.map((proj) => (
                  <li key={proj.id}>
                    <Link to={`/project/${proj.id}?role=school`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0" aria-hidden="true">
                        {INFRA_CATEGORY_ICONS[proj.category] || "📦"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-medium text-slate-900">{proj.title}</p>
                          <StatusBadge status={proj.priority} />
                          <StatusBadge status={proj.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {proj.studentsBenefited} students · {proj.ngoPartner} · Due {proj.expectedCompletion}
                        </p>
                        <div className="mt-2 flex items-center gap-3 sm:max-w-md">
                          <ProgressBar value={proj.progress} label={`${proj.title} progress`} />
                          <span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">{formatINR(proj.raised)} of {formatINR(proj.budget)}</span>
                        </div>
                      </div>
                      <LuChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
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
