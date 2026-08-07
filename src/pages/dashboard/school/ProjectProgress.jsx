import React, { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import AddProgressUpdateModal from "../../../components/dashboard/school/AddProgressUpdateModal";
import { SCHOOL_PROJECTS_LIST, INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="school" userName={profile.name} userSub={profile.district} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar role="school" title="Project Progress & Evidence Log" subtitle={profile.name} notifications={[1, 2]} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

          {/* Header & Project Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1 border border-blue-200">
                <span>📈</span> Progress Evidence Center
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">Upload & Manage Project Milestones</h1>
              <p className="text-xs text-slate-500">School Admin logs stage updates (Before, 25%, 50%, 75%, 100%, Completed) for NGO audit.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedProjId}
                onChange={(e) => setSelectedProjId(e.target.value)}
                className="h-11 px-4 border border-slate-200 rounded-full text-xs font-bold focus:border-blue-500 focus:outline-none bg-slate-50 text-slate-800"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-md transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>➕</span> Add Progress Update
              </button>
            </div>
          </div>

          {/* Selected Project Overview Card */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={currentProj.heroImage} alt={currentProj.title} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase">{currentProj.category}</span>
                <h2 className="text-base font-extrabold text-slate-900">{currentProj.title}</h2>
                <p className="text-xs text-slate-500">Assigned NGO Auditor: {currentProj.ngoPartner || "Shiksha Seva Foundation"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-center text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Current Completion</span>
                <span className="text-xl font-black text-emerald-600">{currentProj.progress}%</span>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <span className="text-slate-400 font-bold block">Target Budget</span>
                <span className="text-xl font-black text-slate-900">₹{Number(currentProj.budget).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Timeline Milestones Grid */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
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
                        <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                          Stage: {upd.stage || upd.stageCategory}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          upd.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {upd.status === "verified" ? "🟢 NGO Verified" : "🟡 Awaiting NGO Audit"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{upd.desc || upd.title}</h4>
                      <p className="text-slate-500 text-[11px]">Logged on {upd.date || upd.uploadDate} by {upd.uploadedBy || "School Admin"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      <AddProgressUpdateModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};

export default ProjectProgress;
