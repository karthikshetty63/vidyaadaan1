import React, { useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";
import { SCHOOL_PROJECTS_LIST } from "../../../data/projects";

const Gallery = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);
  const [projects] = useState(SCHOOL_PROJECTS_LIST);
  const [activeStage, setActiveStage] = useState("all"); // "all" | "before" | "working" | "completed"

  const beforePhotos = projects.flatMap((p) => (p.beforePhotos || []).map((img) => ({ ...img, projectTitle: p.title })));
  const workingPhotos = projects.flatMap((p) => (p.workingPhotos || []).map((img) => ({ ...img, projectTitle: p.title })));
  const completionPhotos = projects.flatMap((p) => (p.completionPhotos || []).map((img) => ({ ...img, projectTitle: p.title })));

  const displayPhotos =
    activeStage === "before"
      ? beforePhotos
      : activeStage === "working"
        ? workingPhotos
        : activeStage === "completed"
          ? completionPhotos
          : [...beforePhotos, ...workingPhotos, ...completionPhotos];

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="Progress Media Gallery" subtitle={profile.name} notifications={[1, 2]}>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold mb-1 border border-purple-200">
              <span>🖼️</span> Central Media Repository
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Project Photo Evidence Gallery</h1>
            <p className="text-xs text-slate-500">Auto-organized before, working milestone, and final completion evidence photos.</p>
          </div>

          {/* Stage Selector Pills */}
          <div className="flex gap-2">
            {[
              { id: "all", label: `All (${displayPhotos.length})` },
              { id: "before", label: `📷 Before (${beforePhotos.length})` },
              { id: "working", label: `🏗️ Working (${workingPhotos.length})` },
              { id: "completed", label: `✅ Completed (${completionPhotos.length})` },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActiveStage(pill.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${activeStage === pill.id
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300"
                  }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayPhotos.map((photo, i) => (
            <div key={photo.id || i} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 bg-slate-900 overflow-hidden">
                <img src={photo.image} alt={photo.desc || photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {photo.stage}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  ✓ Verified
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 truncate block">{photo.projectTitle}</span>
                  <h3 className="font-extrabold text-slate-900 text-xs mt-0.5 line-clamp-2">{photo.desc || photo.title}</h3>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>📅 {photo.date}</span>
                  <span>Uploaded by Admin</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </DashboardLayout>
  );
};

export default Gallery;
