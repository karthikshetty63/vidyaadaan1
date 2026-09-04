import React, { useState } from "react";
import { getFundingPercentage } from "../../utils/funding";
import ProjectTimeline from "../transparency/ProjectTimeline";
import UploadPhotoModal from "../transparency/UploadPhotoModal";
import NGOVerifyModal from "../transparency/NGOVerifyModal";

/* ─── Helpers ───────────────────────────────────────────── */
const priorityBadgeCls = {
  Urgent: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

const verificationBadge = {
  verified: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "🟢 NGO Verified" },
  approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "✅ Milestone Approved" },
  pending: { cls: "bg-amber-50  text-amber-700  border-amber-200", label: "🟡 Awaiting NGO Verification" },
  rejected: { cls: "bg-red-50    text-red-700    border-red-200", label: "🔴 Returned for Correction" },
};

const statusLabel = (photos) => {
  if (!photos || photos.length === 0) return null;
  const pending = photos.filter((p) => p.verificationStatus === "pending").length;
  const rejected = photos.filter((p) => p.verificationStatus === "rejected").length;
  if (pending > 0) return `🟡 ${pending} Photo${pending > 1 ? "s" : ""} Awaiting Verification`;
  if (rejected > 0) return `🔴 ${rejected} Photo${rejected > 1 ? "s" : ""} Returned`;
  return null;
};

/* ─── Photo Grid ─────────────────────────────────────────── */
const PhotoGrid = ({ photos, role, onNGOVerify, label }) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="col-span-full py-8 text-center text-slate-400 text-xs font-medium">
        <span className="text-2xl block mb-1">📷</span>
        No {label} photos yet.
      </div>
    );
  }
  return photos.map((photo) => (
    <div key={photo.id} className="relative group rounded-2xl overflow-hidden bg-slate-900 shadow-md">
      <img
        src={photo.image}
        alt={photo.title}
        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      {/* Stage badge */}
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[9px] font-black uppercase backdrop-blur-sm">
        {photo.stageLabel}
      </span>
      {/* Verification badge */}
      <span
        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black border backdrop-blur-sm ${verificationBadge[photo.verificationStatus]?.cls || verificationBadge.pending.cls
          }`}
      >
        {photo.verificationStatus === "verified" ? "✓ Verified" : photo.verificationStatus === "rejected" ? "✗ Returned" : "⏳ Pending"}
      </span>
      {/* Info */}
      <div className="absolute bottom-2 left-2 right-2 text-white">
        <p className="text-[10px] font-extrabold leading-tight truncate">{photo.title}</p>
        <p className="text-[9px] text-slate-300 truncate">{photo.uploadDate} · {photo.uploadedBy}</p>
        {photo.ngoRemark && (
          <p className="text-[9px] text-emerald-300 mt-0.5 truncate">💬 {photo.ngoRemark}</p>
        )}
      </div>
      {/* NGO Verify Button */}
      {role === "ngo" && photo.verificationStatus === "pending" && (
        <button
          onClick={() => onNGOVerify && onNGOVerify(photo)}
          className="absolute bottom-2 right-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black rounded-full transition-colors shadow-md"
        >
          🔍 Verify
        </button>
      )}
    </div>
  ));
};

/* ─── Payment Table ──────────────────────────────────────── */
const PaymentTable = ({ payments }) => {
  if (!payments || payments.length === 0) return (
    <p className="text-xs text-slate-400 text-center py-4">No payment records yet.</p>
  );
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {["Txn ID", "Donor", "Amount", "Date", "Milestone", "Status"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {payments.map((p) => (
            <tr key={p.txnId} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{p.txnId}</td>
              <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{p.donorName}</td>
              <td className="px-4 py-3 font-extrabold text-emerald-700">₹{p.amount.toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.date}</td>
              <td className="px-4 py-3 text-slate-600">{p.milestone}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── InfraProjectCard ───────────────────────────────────── */
/**
 * role: "school" | "ngo" | "donor"
 * - school: can upload Before / Working / Completion photos
 * - ngo:    can verify/reject photos, add remarks; read-only for everything else
 * - donor:  fully read-only
 */
const InfraProjectCard = ({ project, role = "donor" }) => {
  const [photoTab, setPhotoTab] = useState("before");
  const [expanded, setExpanded] = useState(false);
  const [detailTab, setDetailTab] = useState("photos");

  // School upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [localBefore, setLocalBefore] = useState(project.beforePhotos || []);
  const [localWorking, setLocalWorking] = useState(project.workingPhotos || []);
  const [localCompletion, setLocalCompletion] = useState(project.completionPhotos || []);

  // NGO verify modal
  const [verifyPhoto, setVerifyPhoto] = useState(null);

  const allPhotos = { before: localBefore, working: localWorking, completed: localCompletion };
  const currentPhotos = allPhotos[photoTab] || [];

  const handleUpload = (newPhoto) => {
    const tab = newPhoto.tab;
    if (tab === "before") setLocalBefore((p) => [newPhoto, ...p]);
    else if (tab === "completed") setLocalCompletion((p) => [newPhoto, ...p]);
    else setLocalWorking((p) => [newPhoto, ...p]);
  };

  const handleNGOVerify = (photoId, verifierName) => {
    const update = (arr) =>
      arr.map((p) =>
        p.id === photoId
          ? { ...p, verificationStatus: "verified", ngoRemark: `Verified by ${verifierName}` }
          : p
      );
    setLocalBefore(update);
    setLocalWorking(update);
    setLocalCompletion(update);
  };

  const handleNGOReject = (photoId, remark) => {
    const update = (arr) =>
      arr.map((p) =>
        p.id === photoId
          ? { ...p, verificationStatus: "rejected", ngoRemark: remark }
          : p
      );
    setLocalBefore(update);
    setLocalWorking(update);
    setLocalCompletion(update);
  };

  const pendingAlert = statusLabel([...localBefore, ...localWorking, ...localCompletion]);
  const pct = getFundingPercentage(project.budget, project.raised);

  return (
    <>
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
        {/* ── Hero Image ── */}
        <div className="relative h-44 overflow-hidden bg-slate-900 shrink-0 group">
          <img
            src={project.heroImg}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

          {/* Category + Priority */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[9px] font-black uppercase backdrop-blur-md">
              🏗️ {project.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${priorityBadgeCls[project.priority]}`}>
              {project.priority}
            </span>
          </div>

          {/* School info */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-xs font-extrabold text-blue-200">🏫 {project.schoolName}</p>
            <p className="text-[10px] text-slate-300">📍 {project.district}</p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-5 flex-1 flex flex-col gap-3">
          <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>

          {/* NGO verification badge */}
          {project.ngoVerificationStatus && (
            <span className={`self-start px-2.5 py-0.5 rounded-full text-[9px] font-black border ${verificationBadge[project.ngoVerificationStatus]?.cls}`}>
              {verificationBadge[project.ngoVerificationStatus]?.label}
            </span>
          )}

          {/* Alert for pending/rejected */}
          {pendingAlert && role === "school" && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-800">
              {pendingAlert}
            </div>
          )}

          {/* Budget progress */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Budget: ₹{project.budget.toLocaleString("en-IN")}</span>
              <span className="text-emerald-600">
                ₹{project.raised.toLocaleString("en-IN")} raised · {project.progress}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Students benefited */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-base">👧</span>
            <span><strong className="text-slate-800">{project.studentsBenefited}</strong> Students Benefited</span>
          </div>

          {/* ── Expand / Collapse Button ── */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`w-full h-10 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${expanded
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
              }`}
          >
            {expanded ? "▲ Hide Details" : "👁 View Full Project Details"}
          </button>
        </div>

        {/* ── Expanded Detail Panel ── */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50/60">
            {/* Detail Tabs */}
            <div className="flex gap-1 px-5 pt-4 pb-1 overflow-x-auto">
              {[
                { key: "photos", label: "📸 Photos" },
                { key: "timeline", label: "📋 Timeline" },
                ...(role !== "school" ? [{ key: "payments", label: "💳 Payments" }] : []),
                { key: "impact", label: "🌱 Impact" },
                ...(role === "donor" ? [{ key: "thankyou", label: "💌 Thank You" }] : []),
                ...(role === "ngo" ? [{ key: "inspect", label: "🔍 Inspection" }] : []),
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDetailTab(key)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${detailTab === key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* ── PHOTOS TAB ── */}
              {detailTab === "photos" && (
                <div className="space-y-4">
                  {/* Photo type tabs */}
                  <div className="flex gap-2">
                    {[
                      { key: "before", label: `📷 Before (${localBefore.length})` },
                      { key: "working", label: `🏗️ Working (${localWorking.length})` },
                      { key: "completed", label: `✅ Completion (${localCompletion.length})` },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setPhotoTab(key)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black border transition-all ${photoTab === key
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Photo grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <PhotoGrid
                      photos={currentPhotos}
                      role={role}
                      label={photoTab}
                      onNGOVerify={(photo) => setVerifyPhoto(photo)}
                    />
                  </div>

                  {/* School Upload Button */}
                  {role === "school" && (
                    <button
                      onClick={() => setUploadOpen(true)}
                      className="w-full h-11 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <span>📸</span> Upload Photo
                    </button>
                  )}

                  {/* Donor read-only note */}
                  {role === "donor" && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-bold text-blue-700">
                      <span>🔒</span> Read-only access. You can view all photos and progress.
                    </div>
                  )}
                </div>
              )}

              {/* ── TIMELINE TAB ── */}
              {detailTab === "timeline" && project.timeline && project.timeline.length > 0 && (
                <ProjectTimeline stages={project.timeline} />
              )}

              {/* ── PAYMENTS TAB ── */}
              {detailTab === "payments" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold text-slate-700">💳 Payment Transparency</span>
                    {role === "donor" && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black">Read Only</span>
                    )}
                  </div>
                  <PaymentTable payments={project.payments} />
                </div>
              )}

              {/* ── IMPACT TAB ── */}
              {detailTab === "impact" && (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-xs font-extrabold text-emerald-800 mb-1">🌱 Impact Report</p>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      {project.impactStatement || "Impact report will be available after project completion."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
                      <div className="text-2xl font-black text-blue-600">{project.studentsBenefited}</div>
                      <div className="text-[10px] text-slate-500 font-bold mt-0.5">Students Benefited</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
                      <div className="text-2xl font-black text-emerald-600">{project.progress}%</div>
                      <div className="text-[10px] text-slate-500 font-bold mt-0.5">Project Complete</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── THANK YOU TAB (Donor only) ── */}
              {detailTab === "thankyou" && role === "donor" && (
                <div className="space-y-3">
                  {project.thankYouMessage ? (
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-100 rounded-2xl">
                      <p className="text-xs font-extrabold text-blue-800 mb-2">💌 A Message from the School</p>
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{project.thankYouMessage}"</p>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      <span className="text-2xl block mb-1">💌</span>
                      Thank you message will appear after project completion.
                    </div>
                  )}
                </div>
              )}

              {/* ── INSPECTION TAB (NGO only) ── */}
              {detailTab === "inspect" && role === "ngo" && (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-xs font-extrabold text-emerald-800 mb-1">🔍 Inspection Notes</p>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      {project.ngoInspectionNotes || "No inspection notes yet. Conduct a field visit to add remarks."}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-xs font-extrabold text-amber-800 mb-1">📋 Pending Verification</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {[...localBefore, ...localWorking, ...localCompletion].filter(
                        (p) => p.verificationStatus === "pending"
                      ).length} photo(s) awaiting your verification. Go to the Photos tab to verify or reject.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* School Upload Modal */}
      {role === "school" && (
        <UploadPhotoModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUpload={handleUpload}
        />
      )}

      {/* NGO Verify Modal */}
      {role === "ngo" && (
        <NGOVerifyModal
          isOpen={!!verifyPhoto}
          onClose={() => setVerifyPhoto(null)}
          photo={verifyPhoto}
          onVerify={handleNGOVerify}
          onReject={handleNGOReject}
        />
      )}
    </>
  );
};

export default InfraProjectCard;
