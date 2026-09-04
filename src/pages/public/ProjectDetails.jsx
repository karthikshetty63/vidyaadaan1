import React, { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Container from "../../components/layout/Container";
import PaymentFlowModal from "../../components/payment/PaymentFlowModal";
import NGOVerifyModal from "../../components/transparency/NGOVerifyModal";
import AddProgressUpdateModal from "../../components/dashboard/school/AddProgressUpdateModal";
import { INFRA_PROJECTS } from "../../data/infrastructureData";

const PROCESS_TIMELINE = [
  { step: 1, label: "Need Created", desc: "Infrastructure request logged by School Principal", icon: "📝", status: "completed" },
  { step: 2, label: "NGO Assigned", desc: "Shiksha Seva Foundation assigned as NGO Auditor", icon: "🤝", status: "completed" },
  { step: 3, label: "Donations Received", desc: "Escrow funding raised from Donors & CSR", icon: "💰", status: "completed" },
  { step: 4, label: "School Uploaded Before Photos", desc: "Initial state evidence logged by School Admin", icon: "📸", status: "completed" },
  { step: 5, label: "Work Started", desc: "Licensed contractor team mobilized on site", icon: "🏗️", status: "completed" },
  { step: 6, label: "School Uploaded Working Photos", desc: "25%, 50%, 75% progress photos uploaded", icon: "📸", status: "completed" },
  { step: 7, label: "NGO Reviewed Progress", desc: "Field inspector verified construction quality", icon: "📋", status: "completed" },
  { step: 8, label: "School Uploaded Completion Photos", desc: "Final handover evidence uploaded", icon: "📸", status: "current" },
  { step: 9, label: "NGO Final Verification", desc: "Official verification certificate signed", icon: "✅", status: "upcoming" },
  { step: 10, label: "Project Completed", desc: "VIDYADAAN issues Completion Certificate", icon: "🏁", status: "upcoming" },
  { step: 11, label: "Students Benefited", desc: "Handed over for daily student learning", icon: "🎒", status: "upcoming" },
];

const priorityStyles = {
  Urgent: "bg-red-50 text-red-700 border-red-200 font-extrabold",
  High: "bg-orange-50 text-orange-700 border-orange-200 font-bold",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
  Low: "bg-slate-50 text-slate-600 border-slate-200 font-bold",
};

const ProjectDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "donor"; // "school" | "ngo" | "donor"

  const defaultProject = INFRA_PROJECTS[0];
  const matchedProject = INFRA_PROJECTS.find((p) => p.id === id) || defaultProject;

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "updates" | "gallery" | "timeline" | "donations" | "reports"

  // Photos State
  const [beforePhotos, setBeforePhotos] = useState(matchedProject.beforePhotos || []);
  const [workingPhotos, setWorkingPhotos] = useState(matchedProject.workingPhotos || []);
  const [completionPhotos, setCompletionPhotos] = useState(matchedProject.completionPhotos || []);

  // Modals
  const [addUpdateOpen, setAddUpdateOpen] = useState(false);
  const [verifyPhoto, setVerifyPhoto] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleAddUpdate = (newUpdate) => {
    if (newUpdate.stageCategory === "before") {
      setBeforePhotos((prev) => [newUpdate, ...prev]);
    } else if (newUpdate.stageCategory === "completed") {
      setCompletionPhotos((prev) => [newUpdate, ...prev]);
    } else {
      setWorkingPhotos((prev) => [newUpdate, ...prev]);
    }
  };

  const handleNGOVerify = (photoId, verifierName) => {
    const updateArr = (arr) =>
      arr.map((p) =>
        p.id === photoId
          ? { ...p, verificationStatus: "verified", ngoRemark: `Verified by ${verifierName}` }
          : p
      );
    setBeforePhotos(updateArr);
    setWorkingPhotos(updateArr);
    setCompletionPhotos(updateArr);
  };

  const handleNGOReject = (photoId, remark) => {
    const updateArr = (arr) =>
      arr.map((p) =>
        p.id === photoId
          ? { ...p, verificationStatus: "rejected", ngoRemark: remark }
          : p
      );
    setBeforePhotos(updateArr);
    setWorkingPhotos(updateArr);
    setCompletionPhotos(updateArr);
  };

  const allPhotos = [...beforePhotos, ...workingPhotos, ...completionPhotos];
  const raisedPct = Math.round((matchedProject.raised / matchedProject.budget) * 100);
  const remainingBudget = Math.max(0, matchedProject.budget - matchedProject.raised);

  const backLink =
    role === "school"
      ? "/dashboard/school#projects"
      : role === "ngo"
        ? "/dashboard/ngo#needs"
        : "/dashboard/donor#needs";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* ── PROJECT HEADER & BANNER ── */}
      <section className="pt-28 pb-8 bg-white border-b border-slate-200">
        <Container>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link
                to={backLink}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                ← Back to {role.toUpperCase()} Dashboard
              </Link>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                <span>👤 Portal Mode:</span>
                <span className="capitalize text-blue-600">{role === "school" ? "🏫 School Admin" : role === "ngo" ? "🤝 NGO Auditor" : "❤️ Donor"} View</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Hero & Key Meta */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                    🏗️ {matchedProject.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${priorityStyles[matchedProject.priority] || priorityStyles.Medium}`}>
                    {matchedProject.priority} Priority
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    ✓ Verified Govt. School
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {matchedProject.title}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  🏫 {matchedProject.schoolName} · 📍 {matchedProject.district}
                </p>

                {/* Hero Image */}
                <div className="rounded-[28px] overflow-hidden shadow-xl h-72 sm:h-96 relative bg-slate-900 group">
                  <img
                    src={matchedProject.heroImg}
                    alt={matchedProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                    <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                      🤝 Partner NGO: {matchedProject.schoolName.includes("Honnali") ? "Shiksha Seva Foundation" : "Vidya Jyothi NGO"}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-600 text-white font-extrabold">
                      {matchedProject.progress}% Work Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Funding Card */}
              <div className="bg-white rounded-[28px] border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 lg:sticky lg:top-28">
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ring-Fenced Escrow Budget</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-900">₹{matchedProject.raised.toLocaleString("en-IN")}</span>
                    <span className="text-xs font-bold text-slate-500">Goal: ₹{matchedProject.budget.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${raisedPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Remaining: <strong className="text-slate-800">₹{remainingBudget.toLocaleString("en-IN")}</strong></span>
                    <span className="text-emerald-600 font-extrabold">{raisedPct}% Funded</span>
                  </div>
                </div>

                {/* Role-Aware Main Action Button */}
                {role === "school" ? (
                  <button
                    onClick={() => setAddUpdateOpen(true)}
                    className="w-full h-13 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>➕</span> Add Progress Update & Upload Photos
                  </button>
                ) : role === "ngo" ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <span className="text-xs font-extrabold text-emerald-800 block">🔍 NGO Inspector Portal</span>
                    <p className="text-[11px] text-emerald-700">Review updates, verify photos, and sign milestone completion certificates.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full h-13 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-xs rounded-full shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>💙</span> Support This School Project
                  </button>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between"><span>Partner NGO:</span><span className="font-bold text-slate-900">Shiksha Seva Foundation</span></div>
                  <div className="flex justify-between"><span>Principal:</span><span className="font-bold text-slate-900">Principal Suresh Kumar</span></div>
                  <div className="flex justify-between"><span>Students Benefited:</span><span className="font-bold text-emerald-600">{matchedProject.studentsBenefited} Children</span></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── TABS NAVIGATION BAR ── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <Container>
          <div className="flex gap-2 overflow-x-auto py-3">
            {[
              { id: "overview", label: "📊 Overview" },
              { id: "updates", label: `🏗️ Progress Updates (${allPhotos.length})` },
              { id: "gallery", label: "🖼️ Photo Gallery" },
              { id: "timeline", label: "🗺️ Project Timeline" },
              { id: "donations", label: "💳 Donation Details" },
              { id: "reports", label: "📄 Reports" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 border ${activeTab === tab.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* ── TAB CONTENT WORKSPACE ── */}
      <section className="py-10 flex-1">
        <Container>
          <div className="space-y-8">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>⚠️</span> Problem Description & Need
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {matchedProject.impactStatement || "Leaking asbestos roof, broken benches, exposed wiring. 240 students sitting on floor mats without access to digital learning tools."}
                    </p>
                  </div>

                  <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>🎒</span> Direct Student Impact
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {matchedProject.studentsBenefited} children now have access to interactive digital learning. Attendance improved by 34% and mathematics scores by 28% in just one semester.
                    </p>
                  </div>
                </div>

                {/* Required Materials */}
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📦</span> Required Materials & Equipment
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["65-Inch Interactive Smart Screen", "Ergonomic Dual Desks (60 Sets)", "LED Ceiling Lighting Kit", "ISI Certified Conduit Wiring"].map((mat, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>✓</span> {mat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROGRESS UPDATES */}
            {activeTab === "updates" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Project Progress Updates</h3>
                    <p className="text-xs text-slate-500">School Admin uploads progress updates. NGO Auditor verifies every stage.</p>
                  </div>
                  {role === "school" && (
                    <button
                      onClick={() => setAddUpdateOpen(true)}
                      className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>➕</span> Add Progress Update
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {allPhotos.map((photo) => (
                    <div key={photo.id} className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row gap-6">
                      <img src={photo.image} alt={photo.title} className="w-full sm:w-56 h-40 rounded-2xl object-cover shrink-0" />
                      <div className="flex-1 space-y-2 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                            Stage: {photo.stageLabel}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${photo.verificationStatus === "verified"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : photo.verificationStatus === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                            {photo.verificationStatus === "verified" ? "🟢 NGO Verified" : photo.verificationStatus === "rejected" ? "🔴 Returned" : "🟡 Awaiting Verification"}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900">{photo.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{photo.desc}</p>
                        <p className="text-[10px] text-slate-400">Uploaded {photo.uploadDate} by {photo.uploadedBy}</p>

                        {photo.ngoRemark && (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-semibold">
                            💬 NGO Remark: {photo.ngoRemark}
                          </div>
                        )}

                        {role === "ngo" && photo.verificationStatus === "pending" && (
                          <button
                            onClick={() => setVerifyPhoto(photo)}
                            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-full transition-colors shadow-sm"
                          >
                            🔍 Verify & Approve Photo Update
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PHOTO GALLERY */}
            {activeTab === "gallery" && (
              <div className="space-y-8">
                {[
                  { title: "📷 Before Photos", data: beforePhotos },
                  { title: "🏗️ Working Photos", data: workingPhotos },
                  { title: "✅ Completion Photos", data: completionPhotos },
                ].map((sec) => (
                  <div key={sec.title} className="space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900">{sec.title}</h3>
                    {sec.data.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 italic">No photos uploaded in this stage yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sec.data.map((photo) => (
                          <div key={photo.id} className="bg-white rounded-[24px] border border-slate-200 shadow-md overflow-hidden flex flex-col">
                            <div className="relative h-44 bg-slate-900">
                              <img src={photo.image} alt={photo.title} className="w-full h-full object-cover" />
                              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-white/90 backdrop-blur-sm text-slate-800">
                                {photo.verificationStatus === "verified" ? "✓ Verified" : "⏳ Pending"}
                              </span>
                            </div>
                            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                              <div>
                                <h4 className="font-extrabold text-slate-900 mb-1">{photo.title}</h4>
                                <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{photo.desc}</p>
                              </div>
                              <span className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">Uploaded {photo.uploadDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: TIMELINE */}
            {activeTab === "timeline" && (
              <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">🗺️ Standard Project Process Flow Timeline</h3>
                  <p className="text-xs text-slate-500">Milestone sequence from request creation to final student handover</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PROCESS_TIMELINE.map((item) => (
                    <div
                      key={item.step}
                      className={`p-4 rounded-2xl border flex items-center gap-3 ${item.status === "completed"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : item.status === "current"
                            ? "bg-blue-50 border-blue-400 text-blue-900 shadow-md"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${item.status === "completed" ? "bg-emerald-600 text-white" : item.status === "current" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                        }`}>
                        {item.icon}
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase opacity-60 block">Step {item.step}</span>
                        <span className="text-xs font-extrabold leading-tight block">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: DONATION DETAILS */}
            {activeTab === "donations" && (
              <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">💳 Financial & Material Donations</h3>
                    <p className="text-xs text-slate-500">Transparent ring-fenced escrow ledger</p>
                  </div>
                  {role === "donor" && (
                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="h-10 px-6 bg-blue-600 text-white font-extrabold text-xs rounded-full shadow-md hover:bg-blue-700 transition-colors"
                    >
                      💙 Donate Money / Materials
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-bold block">Budget Required</span>
                    <span className="text-lg font-black text-slate-900">₹{matchedProject.budget.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-600 font-bold block">Funds Raised</span>
                    <span className="text-lg font-black text-emerald-700">₹{matchedProject.raised.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="text-blue-600 font-bold block">Remaining Amount</span>
                    <span className="text-lg font-black text-blue-700">₹{remainingBudget.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: REPORTS */}
            {activeTab === "reports" && (
              <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">📄 Project Audit Reports</h3>
                  <p className="text-xs text-slate-500">Download official PDF & CSV reports for school records</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Progress Report", "Donation Report", "Completion Report", "Impact Report"].map((rep) => (
                    <div key={rep} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{rep}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Verified by NGO Inspector</p>
                      </div>
                      <button
                        onClick={() => alert(`Downloaded ${rep} PDF`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-full transition-colors"
                      >
                        📥 Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </Container>
      </section>

      <Footer />

      {/* Modals */}
      <AddProgressUpdateModal
        isOpen={addUpdateOpen}
        onClose={() => setAddUpdateOpen(false)}
        onAddUpdate={handleAddUpdate}
      />

      <NGOVerifyModal
        isOpen={!!verifyPhoto}
        onClose={() => setVerifyPhoto(null)}
        photo={verifyPhoto}
        onVerify={handleNGOVerify}
        onReject={handleNGOReject}
      />

      <PaymentFlowModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        targetItem={{ title: matchedProject.title, schoolName: matchedProject.schoolName, amount: 2500 }}
      />
    </div>
  );
};

export default ProjectDetails;
