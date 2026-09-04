import React, { useState } from "react";
import { getAmountRemaining } from "../../utils/funding";

const NGO_SUPPORT_TYPES = [
  { id: "funds", label: "Allocate NGO Funds", icon: "💰", desc: "Release direct financial grants from NGO reserves" },
  { id: "materials", label: "Provide Infrastructure Materials", icon: "📦", desc: "Supply physical equipment, pipes & purifiers" },
  { id: "volunteers", label: "Assign Volunteers", icon: "👥", desc: "Deploy technical coordinators & field inspectors" },
  { id: "sponsor", label: "Sponsor Entire Project", icon: "🏆", desc: "Underwrite 100% of the project budget" },
  { id: "csr", label: "CSR Partnership", icon: "💼", desc: "Match corporate CSR funding for infrastructure" },
  { id: "joint", label: "Joint Funding", icon: "🤝", desc: "Co-fund alongside individual donors" },
];

const MATERIAL_OPTIONS = [
  "RO Water Purifier",
  "Water Tank",
  "Pipes",
  "Electrical Wiring",
  "Installation Kit",
  "Maintenance Kit",
  "Plumbing Materials",
  "Other Equipment",
];

const VOLUNTEER_ROLES = [
  "Project Coordinator",
  "Electrician",
  "Plumber",
  "Technician",
  "Civil Engineer",
  "Field Officer",
];

const PROCESS_TIMELINE_STEPS = [
  { label: "School Created", icon: "📝", status: "done" },
  { label: "NGO Reviews", icon: "🔍", status: "done" },
  { label: "NGO Approves Support", icon: "🤝", status: "current" },
  { label: "School Starts Work", icon: "🏗️", status: "upcoming" },
  { label: "Working Photos Uploaded", icon: "📸", status: "upcoming" },
  { label: "NGO Reviews Progress", icon: "📋", status: "upcoming" },
  { label: "Completion Photos Uploaded", icon: "📸", status: "upcoming" },
  { label: "NGO Final Verification", icon: "✅", status: "upcoming" },
  { label: "Project Completed", icon: "🏁", status: "upcoming" },
];

const NGOProjectSupportModal = ({ isOpen, onClose, need, onSupportSuccess }) => {
  // Support Type Selection
  const [selectedSupportTypes, setSelectedSupportTypes] = useState(["funds", "materials", "volunteers"]);

  // Allocation Fields
  const [allocatedAmount, setAllocatedAmount] = useState(45000);
  const [fundingSource, setFundingSource] = useState("NGO Budget");
  const [completionDate, setCompletionDate] = useState("2026-09-30");

  // Material Support Checkboxes
  const [selectedMaterials, setSelectedMaterials] = useState(["RO Water Purifier", "Water Tank", "Pipes", "Plumbing Materials"]);

  // Volunteer Support Fields
  const [selectedVolunteerRoles, setSelectedVolunteerRoles] = useState(["Project Coordinator", "Plumber", "Technician"]);
  const [volunteerCount, setVolunteerCount] = useState(4);
  const [visitDate, setVisitDate] = useState("2026-08-15");

  // Inspection Checklist & Remarks
  const [inspectionChecklist, setInspectionChecklist] = useState({
    schoolVerified: true,
    needVerified: true,
    budgetVerified: true,
    beforePhotosReviewed: true,
    siteInspectionCompleted: true,
  });
  const [inspectionRemarks, setInspectionRemarks] = useState(
    "Field visit conducted on 10 Aug 2026. The water contamination level at Government High School Chitradurga requires immediate RO purification. Before photos and site assessment confirmed. Approved for immediate deployment."
  );

  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "support" | "inspection" | "timeline"

  if (!isOpen || !need) return null;

  const {
    label = "RO Drinking Water Purifier Unit",
    schoolName = "Government High School",
    district = "Chitradurga, Karnataka",
    category = "Water & Sanitation",
    amount: targetCost = "₹45,000",
    progress = 35,
    priority = "Urgent",
    icon = "🚰",
    studentsBenefited = 320,
    beforePhotos = [
      {
        url: "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=400&auto=format&fit=crop",
        date: "12 Jan 2026",
        desc: "Old leaking water tap area. Students currently drinking untreated groundwater.",
      },
      {
        url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop",
        date: "15 Jan 2026",
        desc: "Proposed installation site inside school kitchen area.",
      },
    ],
  } = need;

  const targetNum = typeof targetCost === "number" ? targetCost : parseInt(targetCost.replace(/[^0-9]/g, "")) || 45000;
  const raised = Math.round((targetNum * progress) / 100);
  const remaining = getAmountRemaining(targetNum, raised);

  const toggleSupportType = (id) => {
    setSelectedSupportTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleMaterial = (item) => {
    setSelectedMaterials((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item]
    );
  };

  const toggleRole = (role) => {
    setSelectedVolunteerRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleChecklist = (key) => {
    setInspectionChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (actionType) => {
    setSubmitted(true);
    if (onSupportSuccess) {
      onSupportSuccess({
        needId: need.id,
        needLabel: label,
        schoolName,
        allocatedAmount,
        fundingSource,
        materials: selectedMaterials,
        volunteers: volunteerCount,
        actionType,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-6 z-10 flex flex-col max-h-[90vh]">

        {/* ── HEADER ── */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-700 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 border border-white/20">
              🤝
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-300/30 text-[10px] font-black uppercase">
                  NGO Project Support
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  ✓ Verified Govt. School
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white truncate flex items-center gap-2">
                <span>{icon}</span> {label}
              </h2>
              <p className="text-xs text-emerald-100 truncate">
                🏫 {schoolName} · 📍 {district} · Category: <span className="font-bold">{category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          /* ── SUCCESS SCREEN ── */
          <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-xl shadow-emerald-500/20">
              ✅
            </div>
            <div>
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                Project Approved & Resources Allocated
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3 mb-2">
                Support Confirmed for {schoolName}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Shiksha Seva Foundation has officially approved <strong>{label}</strong>. Allocated <strong>₹{Number(allocatedAmount).toLocaleString("en-IN")}</strong> from <strong>{fundingSource}</strong>, <strong>{selectedMaterials.length} material items</strong>, and <strong>{volunteerCount} volunteers</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Allocated Funding:</span>
                <strong className="text-slate-900">₹{Number(allocatedAmount).toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Materials Assigned:</span>
                <strong className="text-slate-900">{selectedMaterials.join(", ")}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Volunteers Deployed:</span>
                <strong className="text-slate-900">{volunteerCount} Volunteers ({selectedVolunteerRoles.join(", ")})</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Completion Target:</span>
                <strong className="text-emerald-700">{completionDate}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-emerald-600/25 transition-all"
            >
              Done & Return to NGO Dashboard
            </button>
          </div>
        ) : (
          /* ── MAIN MODAL BODY ── */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Modal Navigation Bar */}
            <div className="flex gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100 overflow-x-auto shrink-0">
              {[
                { id: "overview", label: "📊 Overview & Photos" },
                { id: "support", label: "⚡ Support & Resources" },
                { id: "inspection", label: "🔍 Inspection & Remarks" },
                { id: "timeline", label: "🗺️ Project Process Flow" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 border ${activeTab === tab.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              {/* ── TAB 1: OVERVIEW & BEFORE PHOTOS ── */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Project Overview Stats Grid */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Project Overview</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">Estimated Budget</span>
                        <span className="text-sm sm:text-base font-black text-slate-900">₹{targetNum.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                        <span className="text-[10px] text-emerald-600 font-bold block">Raised Amount</span>
                        <span className="text-sm sm:text-base font-black text-emerald-700">₹{raised.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                        <span className="text-[10px] text-blue-600 font-bold block">Remaining Amount</span>
                        <span className="text-sm sm:text-base font-black text-blue-700">₹{remaining.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                        <span className="text-[10px] text-amber-600 font-bold block">Priority & Status</span>
                        <span className="text-xs font-black text-amber-800">{priority} · In Progress</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Beneficiaries */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Current Progress</span>
                        <span className="text-emerald-600 font-extrabold">{progress}% Funded</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shrink-0">
                      <span className="text-xl">🎒</span>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{studentsBenefited} Students</span>
                        <span className="text-[9px] text-slate-400 font-bold">Direct Beneficiaries</span>
                      </div>
                    </div>
                  </div>

                  {/* Before Photos Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">📷 Uploaded Before Photos</h4>
                        <p className="text-[11px] text-slate-400">Submitted by School Admin for infrastructure audit</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Only School Admin can upload photos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {beforePhotos.map((photo, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group relative">
                          <img
                            src={photo.url}
                            alt="Before photo"
                            className="w-full h-40 object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase">
                            BEFORE
                          </span>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-xs font-bold leading-tight">{photo.desc}</p>
                            <span className="text-[9px] text-slate-300">Uploaded {photo.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: NGO SUPPORT & RESOURCES ── */}
              {activeTab === "support" && (
                <div className="space-y-6">

                  {/* NGO Support Type Cards */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                      Choose Support Type (Multiple Allowed)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {NGO_SUPPORT_TYPES.map((type) => {
                        const active = selectedSupportTypes.includes(type.id);
                        return (
                          <div
                            key={type.id}
                            onClick={() => toggleSupportType(type.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${active
                                ? "bg-emerald-50/80 border-emerald-600 shadow-md shadow-emerald-500/10"
                                : "bg-white border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{type.icon}</span>
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${active ? "bg-emerald-600 text-white" : "border border-slate-300"
                                }`}>
                                {active ? "✓" : ""}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 leading-tight mb-0.5">{type.label}</h4>
                              <p className="text-[10px] text-slate-400 leading-tight">{type.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Allocate Funding Section */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💰</span> Allocate Funding
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Allocated Amount (₹) *
                        </label>
                        <input
                          type="number"
                          value={allocatedAmount}
                          onChange={(e) => setAllocatedAmount(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Funding Source *
                        </label>
                        <select
                          value={fundingSource}
                          onChange={(e) => setFundingSource(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="NGO Budget">NGO Budget</option>
                          <option value="CSR Fund">CSR Fund</option>
                          <option value="Emergency Fund">Emergency Fund</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Target Completion Date *
                        </label>
                        <input
                          type="date"
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Material Support Section */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📦</span> Material Support (Check All Provided Items)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MATERIAL_OPTIONS.map((item) => {
                        const checked = selectedMaterials.includes(item);
                        return (
                          <label
                            key={item}
                            onClick={() => toggleMaterial(item)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${checked
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <span>{checked ? "✓" : "○"}</span>
                            <span className="truncate">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Volunteer Support Section */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👥</span> Assign Volunteers & Field Officers
                    </h4>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 mb-2">
                        Select Required Roles:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {VOLUNTEER_ROLES.map((role) => {
                          const active = selectedVolunteerRoles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => toggleRole(role)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active
                                  ? "bg-teal-600 text-white border-teal-600"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                                }`}
                            >
                              {active ? "✓ " : "+ "}{role}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Number of Volunteers Assigned
                        </label>
                        <input
                          type="number"
                          value={volunteerCount}
                          onChange={(e) => setVolunteerCount(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                          Scheduled Site Visit Date
                        </label>
                        <input
                          type="date"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ── TAB 3: PROJECT INSPECTION ── */}
              {activeTab === "inspection" && (
                <div className="space-y-6">
                  {/* Inspection Checklist */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🔍</span> NGO Inspection Checklist
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "schoolVerified", label: "School Identity & UDISE Code Verified" },
                        { key: "needVerified", label: "Infrastructure Need Verified on Site" },
                        { key: "budgetVerified", label: "Budget & Estimates Verified" },
                        { key: "beforePhotosReviewed", label: "Before Photos Reviewed & Approved" },
                        { key: "siteInspectionCompleted", label: "Initial Site Inspection Completed" },
                      ].map(({ key, label }) => {
                        const checked = inspectionChecklist[key];
                        return (
                          <div
                            key={key}
                            onClick={() => toggleChecklist(key)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${checked
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                : "bg-white border-slate-200 text-slate-600"
                              }`}
                          >
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold ${checked ? "bg-emerald-600 text-white" : "border border-slate-300 text-transparent"
                              }`}>
                              ✓
                            </span>
                            <span className="text-xs font-bold">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inspection Remarks */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      Inspection Remarks & Quality Notes *
                    </label>
                    <textarea
                      rows={5}
                      value={inspectionRemarks}
                      onChange={(e) => setInspectionRemarks(e.target.value)}
                      placeholder="Enter detailed inspection findings, audit notes, or recommendations for the contractor..."
                      className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 4: PROJECT PROCESS FLOW TIMELINE ── */}
              {activeTab === "timeline" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 mb-1">🗺️ Standard Project Process Flow</h4>
                    <p className="text-xs text-slate-500">Every infrastructure project follows this transparent, verified milestone sequence</p>
                  </div>

                  {/* Vertical / Grid Flow */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PROCESS_TIMELINE_STEPS.map((step, idx) => {
                      const isDone = step.status === "done";
                      const isCurrent = step.status === "current";
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${isDone
                              ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                              : isCurrent
                                ? "bg-blue-50 border-blue-400 text-blue-800 shadow-md animate-pulse"
                                : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${isDone ? "bg-emerald-600 text-white" : isCurrent ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                            }`}>
                            {step.icon}
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase opacity-60 block">Step {idx + 1}</span>
                            <span className="text-xs font-extrabold leading-tight block">{step.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold leading-relaxed">
                    💡 <strong>Transparency Rule:</strong> School Admin uploads Before, Working, and Completion photos. NGO partners verify progress at each stage and approve milestone releases.
                  </div>
                </div>
              )}

            </div>

            {/* ── FOOTER ACTION BUTTONS ── */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-11 px-6 border border-slate-300 text-slate-700 font-extrabold text-xs rounded-full hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSubmit("approve")}
                  className="flex-1 sm:flex-none h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>✅</span> Approve Project
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit("allocate")}
                  className="flex-1 sm:flex-none h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-full shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>⚡</span> Allocate Resources
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default NGOProjectSupportModal;
