import React, { useState } from "react";

const REPORT_TYPES = [
  { id: "donation", label: "💰 Donation Report", desc: "Complete log of funds received via UPI, NetBanking, CSR, and card payments" },
  { id: "infra", label: "🏗 Infrastructure Report", desc: "Detailed breakdown of classrooms, toilets, drinking water, and lab projects" },
  { id: "event", label: "🎉 Event Report", desc: "School celebrations, item sponsorships, food packages, and volunteer participation" },
  { id: "impact", label: "🌱 Impact Report", desc: "Student attendance metrics, learning outcome improvements, and 80G summary" },
  { id: "completion", label: "✅ Completion Report", desc: "Verified milestone certificates, auditor sign-offs, and before/after comparisons" },
];

const MOCK_REPORTS = {
  donation: [
    { date: "27 Jul 2026", donor: "Ramesh Kumar", type: "Individual", amount: "₹5,000", purpose: "Sports Day Medals", receipt: "VD-80G-9921", status: "Verified" },
    { date: "25 Jul 2026", donor: "Shiksha Foundation", type: "NGO Partner", amount: "₹25,000", purpose: "Sports Kits & Trophies", receipt: "VD-80G-9922", status: "Processing" },
    { date: "22 Jul 2026", donor: "Priya Mehta", type: "CSR Contributor", amount: "₹10,000", purpose: "RO Water Purifier", receipt: "VD-80G-9923", status: "Verified" },
    { date: "18 Jul 2026", donor: "Tech Corp Ltd", type: "Corporate CSR", amount: "₹50,000", purpose: "Solar Panel Installation", receipt: "VD-80G-9924", status: "Verified" },
  ],
  infra: [
    { project: "Smart Classroom Setup", category: "Classroom", budget: "₹1,20,000", raised: "₹42,000", progress: "35%", status: "In Progress", ngo: "Shiksha Seva Foundation" },
    { project: "Girls Toilet Renovation", category: "Toilets & Sanitation", budget: "₹45,000", raised: "₹32,400", progress: "72%", status: "In Progress", ngo: "Vidya Jyothi NGO" },
    { project: "Library Books (400+)", category: "Library", budget: "₹22,000", raised: "₹2,200", progress: "10%", status: "Pending NGO Audit", ngo: "Pending" },
    { project: "RO Water Purifier Unit", category: "Drinking Water", budget: "₹18,000", raised: "₹0", progress: "0%", status: "Pending Funding", ngo: "Pending" },
  ],
  event: [
    { event: "Annual Sports Day 2026", date: "15 Aug 2026", target: "₹45,000", raised: "₹32,500", items: "8/10 Sponsored", volunteers: "6 Assigned", status: "Active" },
    { event: "Science & Innovation Fair", date: "28 Feb 2026", target: "₹28,000", raised: "₹28,000", items: "Fully Sponsored", volunteers: "4 Assigned", status: "Completed" },
  ],
  impact: [
    { metric: "Total Students Benefited", value: "438 Children", detail: "240 Primary + 198 Higher Primary" },
    { metric: "Classroom Attendance Increase", value: "+34% Attendance", detail: "Measured post Smart Board installation" },
    { metric: "Mathematics Score Improvement", value: "+28% Pass Rate", detail: "Digital learning module results" },
    { metric: "Sanitation Compliance", value: "100% Functional", detail: "Running water & clean girls toilets" },
  ],
  completion: [
    { certId: "CERT-2026-001", project: "Classroom Renovation", completionDate: "15 Jun 2025", verifiedBy: "NGO Inspector - Shiksha Seva", pdf: "Available" },
    { certId: "CERT-2025-044", project: "Library Setup", completionDate: "10 Apr 2025", verifiedBy: "NGO Auditor - Vidya Jyothi", pdf: "Available" },
  ],
};

const SchoolReportsWidget = () => {
  const [activeReport, setActiveReport] = useState("donation");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (format) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Downloaded official VIDYADAAN ${REPORT_TYPES.find(r => r.id === activeReport)?.label} in ${format} format.`);
    }, 800);
  };

  return (
    <section id="reports" className="bg-white rounded-[24px] border border-slate-100 shadow-md p-6 scroll-mt-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1 border border-blue-200">
            <span>📄</span> Section 6 · Official School Audits
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Government School Reports & Analytics</h2>
          <p className="text-xs text-slate-500">Generate and export verified financial, infrastructure, event, and impact reports for education authorities.</p>
        </div>

        {/* Download Buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleDownload("PDF")}
            disabled={downloading}
            className="h-10 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-full shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
          >
            <span>📥</span> Download PDF
          </button>
          <button
            onClick={() => handleDownload("CSV")}
            disabled={downloading}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <span>📊</span> Export CSV
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {REPORT_TYPES.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setActiveReport(rep.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border text-left ${
              activeReport === rep.id
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* Report Summary Description */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-blue-900 font-medium">
        💡 {REPORT_TYPES.find((r) => r.id === activeReport)?.desc}
      </div>

      {/* Dynamic Data Table / Cards */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        {activeReport === "donation" && (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Donor / Partner</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Purpose</th>
                <th className="px-4 py-3 text-left">Receipt No.</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_REPORTS.donation.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-500">{row.date}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900">{row.donor}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{row.type}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{row.amount}</td>
                  <td className="px-4 py-3 text-slate-700">{row.purpose}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{row.receipt}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === "infra" && (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                <th className="px-4 py-3 text-left">Project Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Budget</th>
                <th className="px-4 py-3 text-left">Raised</th>
                <th className="px-4 py-3 text-left">Progress</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Assigned NGO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_REPORTS.infra.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-extrabold text-slate-900">{row.project}</td>
                  <td className="px-4 py-3 text-slate-600 font-bold">{row.category}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-800">{row.budget}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{row.raised}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{row.progress}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.ngo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === "event" && (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                <th className="px-4 py-3 text-left">Event Name</th>
                <th className="px-4 py-3 text-left">Event Date</th>
                <th className="px-4 py-3 text-left">Target Goal</th>
                <th className="px-4 py-3 text-left">Raised</th>
                <th className="px-4 py-3 text-left">Items Sponsored</th>
                <th className="px-4 py-3 text-left">Volunteers</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_REPORTS.event.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-extrabold text-slate-900">{row.event}</td>
                  <td className="px-4 py-3 text-slate-500 font-medium">{row.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{row.target}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{row.raised}</td>
                  <td className="px-4 py-3 text-slate-700 font-bold">{row.items}</td>
                  <td className="px-4 py-3 text-purple-600 font-bold">{row.volunteers}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === "impact" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/40">
            {MOCK_REPORTS.impact.map((row, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">{row.metric}</span>
                <div className="text-lg font-black text-emerald-600">{row.value}</div>
                <p className="text-xs text-slate-500 font-medium">{row.detail}</p>
              </div>
            ))}
          </div>
        )}

        {activeReport === "completion" && (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                <th className="px-4 py-3 text-left">Certificate ID</th>
                <th className="px-4 py-3 text-left">Project Name</th>
                <th className="px-4 py-3 text-left">Completion Date</th>
                <th className="px-4 py-3 text-left">Verified By</th>
                <th className="px-4 py-3 text-left">Certificate PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_REPORTS.completion.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-[10px] text-blue-600 font-bold">{row.certId}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900">{row.project}</td>
                  <td className="px-4 py-3 text-slate-500">{row.completionDate}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">✓ {row.verifiedBy}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDownload("PDF")}
                      className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-full text-[10px] font-bold transition-colors"
                    >
                      📄 Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default SchoolReportsWidget;
