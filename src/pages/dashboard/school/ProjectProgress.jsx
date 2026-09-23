import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/FormField";
import PageHeader from "../../../components/ui/PageHeader";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import AddProgressUpdateModal from "../../../components/dashboard/school/AddProgressUpdateModal";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";
import { SCHOOL_PROJECTS_LIST } from "../../../data/projects";

const ProjectProgress = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);
  const [projects] = useState(SCHOOL_PROJECTS_LIST);
  const [selectedProjId, setSelectedProjId] = useState(projects[0]?.id || "proj-001");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const currentProj = projects.find((p) => p.id === selectedProjId) || projects[0];

  const allUpdates = [
    ...(currentProj.beforePhotos || []),
    ...(currentProj.workingPhotos || []),
    ...(currentProj.completionPhotos || []),
  ];

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="Project Progress & Evidence Log" subtitle={profile.name} notifications={[1, 2]}>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <PageHeader
          title="Project progress"
          description="Log stage updates (Before, 25%, 50%, 75%, Completed) for NGO verification."
          actions={
            <>
              <Select aria-label="Project" className="w-full sm:w-72" value={selectedProjId} onChange={(e) => setSelectedProjId(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </Select>
              <Button icon={LuPlus} onClick={() => setIsUploadOpen(true)}>Add progress update</Button>
            </>
          }
        />

        {/* Selected Project Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={currentProj.heroImage} alt={currentProj.title} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase">{currentProj.category}</span>
              <h2 className="text-base font-semibold text-slate-900">{currentProj.title}</h2>
              <p className="text-xs text-slate-500">Assigned NGO Auditor: {currentProj.ngoPartner || "Shiksha Seva Foundation"}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Current Completion</span>
              <span className="text-xl font-semibold text-emerald-600">{currentProj.progress}%</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <span className="text-slate-400 font-bold block">Target Budget</span>
              <span className="text-xl font-semibold text-slate-900">₹{Number(currentProj.budget).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Timeline Milestones Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>📋</span> Milestone Progress Logs ({allUpdates.length})
          </h3>

          {allUpdates.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">No updates logged yet for this project. Click "+ Add Progress Update" above.</p>
          ) : (
            <div className="space-y-4">
              {allUpdates.map((upd) => (
                <div key={upd.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
                  <img src={upd.image} alt={upd.stage} className="w-full sm:w-40 h-28 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between flex-wrap">
                      <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase">
                        Stage: {upd.stage || upd.stageCategory}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${upd.status === "verified"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                        {upd.status === "verified" ? "🟢 NGO Verified" : "🟡 Awaiting NGO Audit"}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{upd.desc || upd.title}</h4>
                    <p className="text-slate-500 text-xs">Logged on {upd.date || upd.uploadDate} by {upd.uploadedBy || "School Admin"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        </div>
      </main>
      <AddProgressUpdateModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </DashboardLayout>
  );
};

export default ProjectProgress;
