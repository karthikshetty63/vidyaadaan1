import React, { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Container from "../components/layout/Container";
import ProjectTimeline from "../components/transparency/ProjectTimeline";
import ProjectPhotoGallery from "../components/transparency/ProjectPhotoGallery";
import PaymentTransparencyPanel from "../components/transparency/PaymentTransparencyPanel";
import UploadPhotoModal from "../components/transparency/UploadPhotoModal";
import NGOVerifyModal from "../components/transparency/NGOVerifyModal";
import { PROJECT_TRANSPARENCY_DATA } from "../data/transparencyData";

// ── Role Config ────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  school: {
    label: "School Admin",
    icon: "🏫",
    banner: "You can upload project evidence photos. NGO will verify each upload.",
    bannerCls: "bg-blue-600",
    pillCls: "bg-blue-50 border-blue-200 text-blue-700",
  },
  ngo: {
    label: "NGO Inspector",
    icon: "🤝",
    banner: "You are the independent verifier. Approve or return photos uploaded by the School Admin.",
    bannerCls: "bg-emerald-600",
    pillCls: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  donor: {
    label: "Donor",
    icon: "❤️",
    banner: "Full transparency view. Every stage, photo, and payment is visible to you — read only.",
    bannerCls: "bg-indigo-600",
    pillCls: "bg-indigo-50 border-indigo-200 text-indigo-700",
  },
};

// ── Navigation tabs ────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "timeline", label: "Timeline", icon: "📍" },
  { id: "gallery", label: "Photo Gallery", icon: "📸" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "impact", label: "Impact & Reports", icon: "📊" },
];

const ProjectTransparencyPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "donor";

  const roleCfg = ROLE_CONFIG[role] || ROLE_CONFIG.donor;
  const { projectMeta, timeline, photoUploads, paymentTransparency, childrenBenefited } =
    PROJECT_TRANSPARENCY_DATA;

  // ── Local state for photos (interactive) ───────────────────────────────
  const [photos, setPhotos] = useState(photoUploads);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [verifyModalPhoto, setVerifyModalPhoto] = useState(null);
  const [activeSection, setActiveSection] = useState("timeline");

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleUpload = (newPhoto) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === newPhoto.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...newPhoto, verificationStatus: "pending" };
        return updated;
      }
      return [newPhoto, ...prev];
    });
    setEditPhoto(null);
  };

  const handleVerify = (photoId, verifier) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, verificationStatus: "verified", ngoRemark: `Verified by ${verifier} on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` }
          : p
      )
    );
    setVerifyModalPhoto(null);
  };

  const handleReject = (photoId, remark) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, verificationStatus: "rejected", ngoRemark: remark } : p
      )
    );
    setVerifyModalPhoto(null);
  };

  const pendingCount = photos.filter((p) => p.verificationStatus === "pending").length;
  const progressPct = Math.min(100, Math.round((projectMeta.raisedAmount / projectMeta.targetBudget) * 100));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <section className="pt-28 pb-10 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <Container>
          <div className="space-y-5">
            {/* Breadcrumb */}
            <Link
              to={`/project/${id || "proj-1"}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors"
            >
              ← Back to Project
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                {/* UDISE + Role Pill Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                    🏫 UDISE: {projectMeta.udise} • Verified Govt. School
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${roleCfg.pillCls}`}
                  >
                    {roleCfg.icon} {roleCfg.label} View
                  </span>
                  {role === "ngo" && pendingCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black animate-pulse">
                      🟡 {pendingCount} Photos Awaiting Your Verification
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {projectMeta.title}
                </h1>
                <p className="text-slate-400 text-sm">
                  📍 {projectMeta.schoolName}, {projectMeta.district} •{" "}
                  <span className="text-emerald-400 font-bold">
                    🤝 NGO Partner: {projectMeta.ngoPartner}
                  </span>
                </p>
              </div>

              {/* Stats Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "Progress", val: `${projectMeta.currentProgress}%`, icon: "📈" },
                  { label: "Donors", val: projectMeta.donorCount, icon: "❤️" },
                  { label: "Children", val: projectMeta.studentsCount, icon: "🎒" },
                  { label: "NGO Verified", val: "✓", icon: "🛡️" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-center">
                    <span className="text-lg block">{stat.icon}</span>
                    <p className="text-xl font-black">{stat.val}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-400">Project Funding Progress</span>
                <span className="text-emerald-400">
                  ₹{projectMeta.raisedAmount.toLocaleString("en-IN")} / ₹{projectMeta.targetBudget.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Role Permission Banner ──────────────────────────────────────── */}
      <div className={`${roleCfg.bannerCls} text-white py-3`}>
        <Container>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="text-lg">{roleCfg.icon}</span>
            <span>{roleCfg.banner}</span>
            {role === "school" && (
              <button
                onClick={() => { setEditPhoto(null); setUploadModalOpen(true); }}
                className="ml-auto px-5 py-2 bg-white text-blue-700 font-extrabold text-xs rounded-full shadow hover:bg-blue-50 transition-colors shrink-0"
              >
                📸 Upload Photo
              </button>
            )}
          </div>
        </Container>
      </div>

      {/* ── Section Navigation ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <Container>
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  activeSection === sec.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 py-12">
        <Container>
          <div className="space-y-16">

            {/* ── SECTION: TIMELINE ──────────────────────────────────── */}
            <section id="section-timeline" className="scroll-mt-24 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
                    📍 16-Stage Project Journey
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Project Transparency Timeline</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Every stage from need creation to 80G certificate — tracked and verified.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                    Completed
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse block" />
                    In Progress
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-300 block" />
                    Pending
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left half */}
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-lg p-6 sm:p-8">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-5">
                    Stages 1 – 8
                  </h4>
                  <ProjectTimeline stages={timeline.slice(0, 8)} />
                </div>
                {/* Right half */}
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-lg p-6 sm:p-8">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-5">
                    Stages 9 – 16
                  </h4>
                  <ProjectTimeline stages={timeline.slice(8)} />
                </div>
              </div>
            </section>

            {/* ── SECTION: PHOTO GALLERY ─────────────────────────────── */}
            <section id="section-gallery" className="scroll-mt-24 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-2">
                  📸 Photo Evidence Gallery
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Before, Progress & Completion Photos</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {role === "school"
                    ? "Upload evidence at each stage. NGO will verify your uploads."
                    : role === "ngo"
                    ? "Review and verify the photos uploaded by the School Admin."
                    : "Every photo is geotagged, timestamped, and NGO-verified for complete transparency."}
                </p>
              </div>

              <ProjectPhotoGallery
                photos={photos}
                role={role}
                onUploadClick={(photo) => {
                  setEditPhoto(photo || null);
                  setUploadModalOpen(true);
                }}
                onVerifyClick={(photo) => setVerifyModalPhoto(photo)}
                onRejectClick={(photo) => setVerifyModalPhoto(photo)}
              />
            </section>

            {/* ── SECTION: PAYMENTS ──────────────────────────────────── */}
            <section id="section-payments" className="scroll-mt-24 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
                  💳 Payment Transparency
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Payment Audit Ledger</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Every rupee is ring-fenced in escrow and released milestone-by-milestone. Zero misuse possible.
                </p>
              </div>
              <PaymentTransparencyPanel
                payments={paymentTransparency}
                targetBudget={projectMeta.targetBudget}
                raisedAmount={projectMeta.raisedAmount}
              />
            </section>

            {/* ── SECTION: IMPACT & REPORTS ──────────────────────────── */}
            <section id="section-impact" className="scroll-mt-24 space-y-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-2">
                  📊 Impact, Reports & Certificates
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Children Benefited & Impact</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Real impact numbers and certificates for this project.
                </p>
              </div>

              {/* Children Benefited Grid */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    🎒 {projectMeta.studentsCount} Children Benefited — Grade Breakdown
                  </h4>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Attendance +34%
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-100">
                  {childrenBenefited.map((grade) => (
                    <div key={grade.grade} className="p-5 text-center">
                      <span className="text-2xl block mb-1">{grade.icon}</span>
                      <p className="text-2xl font-black text-slate-900">{grade.count}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{grade.grade}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Statement */}
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-[24px] border border-blue-100 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">📊</span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base mb-2">Impact Statement</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{projectMeta.impactStatement}</p>
                  </div>
                </div>
              </div>

              {/* Thank You Message */}
              <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-xl">💌</span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Thank You Message</h4>
                    <p className="text-[10px] text-slate-500">From Principal Suresh Kumar, {projectMeta.schoolName}</p>
                  </div>
                </div>
                <blockquote className="pl-4 border-l-4 border-blue-400 italic text-sm text-slate-700 leading-relaxed">
                  "{projectMeta.thankYouMessage}"
                </blockquote>
              </div>

              {/* Reports & Certificates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { icon: "📜", title: "80G Tax Certificate", code: "FORM 10BE", desc: "Auto-generated digital tax receipt with QR code verification" },
                  { icon: "🎓", title: "NGO Completion Audit", code: "AUDIT-2026", desc: "Third-party verification by Chartered Accountant" },
                  { icon: "📊", title: "Impact Report", code: "IMPACT-2026", desc: "Student attendance, score improvements, and photos" },
                ].map((item) => (
                  <div
                    key={item.code}
                    className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-md hover:shadow-xl hover:border-blue-300 transition-all group space-y-3"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xl transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">{item.code}</span>
                      <h5 className="font-extrabold text-slate-900 text-sm mt-0.5">{item.title}</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => alert(`Downloading ${item.title}`)}
                      className="w-full h-10 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1.5"
                    >
                      📥 Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </Container>
      </main>

      <Footer />

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <UploadPhotoModal
        isOpen={uploadModalOpen}
        onClose={() => { setUploadModalOpen(false); setEditPhoto(null); }}
        onUpload={handleUpload}
        editPhoto={editPhoto}
      />

      <NGOVerifyModal
        isOpen={!!verifyModalPhoto}
        onClose={() => setVerifyModalPhoto(null)}
        photo={verifyModalPhoto}
        onVerify={handleVerify}
        onReject={handleReject}
      />
    </div>
  );
};

export default ProjectTransparencyPage;
