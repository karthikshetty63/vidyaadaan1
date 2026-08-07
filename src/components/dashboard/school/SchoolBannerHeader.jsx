import React from "react";

const SchoolBannerHeader = ({ profile, onEditProfile, onCreateProject, onCreateEvent }) => {
  return (
    <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-700/20">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
          {[...Array(20)].map((_, i) => <circle key={i} cx={i * 35} cy={(i % 3) * 60 + 20} r="40" fill="white" />)}
        </svg>
      </div>

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 border border-white/20 shadow-inner">
            {profile.logo || "🏫"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-300/30 text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Govt. School
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                UDISE: {profile.udise}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.name}</h1>
            <p className="text-xs text-blue-100 font-medium">
              📍 {profile.district} · 👨‍🎓 {profile.studentsCount} Students · 👨‍🏫 {profile.teachersCount} Teachers
            </p>
          </div>
        </div>

        {/* Development Score & Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-2.5 text-center border border-white/15">
            <div className="text-xl sm:text-2xl font-black">{profile.developmentScore}</div>
            <div className="text-[10px] font-bold text-blue-100">Dev Score</div>
          </div>

          <button
            onClick={onCreateProject}
            className="h-11 px-5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>➕</span> Create Project
          </button>
          <button
            onClick={onCreateEvent}
            className="h-11 px-5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>🎉</span> Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolBannerHeader;
