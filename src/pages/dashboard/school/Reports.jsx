import React, { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import SchoolReportsWidget from "../../../components/dashboard/school/SchoolReportsWidget";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

const Reports = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="school" userName={profile.name} userSub={profile.district} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar role="school" title="Official School Audit Reports" subtitle={profile.name} notifications={[1, 2]} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1 border border-blue-200">
                <span>📄</span> Official Government Compliance
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">Audit Reports & Impact Analytics</h1>
              <p className="text-xs text-slate-500">Generate, view, and export verified infrastructure, donation, event, completion, and student impact reports.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert("Downloaded PDF Report Bundle.")}
                className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
              >
                <span>📥</span> Download PDF
              </button>
              <button
                onClick={() => alert("Downloaded Excel Report Bundle.")}
                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
              >
                <span>📊</span> Download Excel
              </button>
            </div>
          </div>

          {/* School Reports Widget */}
          <SchoolReportsWidget />

        </main>
      </div>
    </div>
  );
};

export default Reports;
