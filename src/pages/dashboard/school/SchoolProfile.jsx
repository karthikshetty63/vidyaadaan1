import React, { useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import SchoolProfileModal from "../../../components/dashboard/school/SchoolProfileModal";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

const SchoolProfile = () => {
  const [profile, setProfile] = useState(INITIAL_SCHOOL_PROFILE);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const facilities = [
    { label: "Smart Digital Classroom", available: true, note: "65-Inch Smart Screen" },
    { label: "Computer Laboratory", available: true, note: "10 Refurbished PCs" },
    { label: "Girls Sanitation Block", available: true, note: "Running Water & Tiles" },
    { label: "Commercial RO Water Unit", available: false, note: "Funding Request Active" },
    { label: "Sports Playground", available: true, note: "2-Acre Multipurpose Field" },
    { label: "Rooftop Solar Backup", available: false, note: "Pending CSR Sponsorship" },
  ];

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="School Profile Management" subtitle={profile.name} notifications={[1, 2]}>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

        {/* Banner Card */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-[28px] p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border border-white/20 shadow-inner shrink-0">
              {profile.logo || "🏫"}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Government School
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{profile.name}</h1>
              <p className="text-xs text-blue-100 font-medium">UDISE Code: {profile.udise} · Established {profile.established}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="h-11 px-6 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-full shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            ✏️ Edit School Profile
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-5 bg-white rounded-[20px] border border-slate-200 shadow-sm space-y-1">
            <span className="text-slate-400 font-bold block">Total Enrolled Students</span>
            <span className="text-2xl font-black text-slate-900">{profile.studentsCount} Kids</span>
          </div>
          <div className="p-5 bg-white rounded-[20px] border border-slate-200 shadow-sm space-y-1">
            <span className="text-slate-400 font-bold block">Teaching Staff</span>
            <span className="text-2xl font-black text-slate-900">{profile.teachersCount} Teachers</span>
          </div>
          <div className="p-5 bg-white rounded-[20px] border border-slate-200 shadow-sm space-y-1">
            <span className="text-slate-400 font-bold block">Development Score</span>
            <span className="text-2xl font-black text-blue-600">{profile.developmentScore} / 100</span>
          </div>
          <div className="p-5 bg-white rounded-[20px] border border-slate-200 shadow-sm space-y-1">
            <span className="text-slate-400 font-bold block">Verification Status</span>
            <span className="text-2xl font-black text-emerald-600">✓ Verified</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Principal & Credentials */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>👤</span> Principal & Administrative Info
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Principal Name</span>
                <span className="font-extrabold text-slate-900">{profile.principalName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Contact Phone</span>
                <span className="font-extrabold text-slate-900">{profile.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Official Email</span>
                <span className="font-extrabold text-slate-900">{profile.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Location Address</span>
                <span className="font-extrabold text-slate-900 text-right max-w-xs">{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Checklist */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>🏗️</span> Campus Facility Status
            </h3>
            <div className="space-y-2 text-xs">
              {facilities.map((f) => (
                <div key={f.label} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{f.label}</span>
                    <span className="text-[10px] text-slate-400">{f.note}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${f.available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                    {f.available ? "✓ Operational" : "⏳ Pending Need"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
      <SchoolProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        schoolData={profile}
        onSave={(updated) => setProfile({ ...profile, ...updated })}
      />
    </DashboardLayout>
  );
};

export default SchoolProfile;
