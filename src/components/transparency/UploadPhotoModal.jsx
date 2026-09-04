import React, { useState } from "react";

const STAGE_OPTIONS = [
  { value: "before", label: "📷 Before (Initial State)", percent: 0 },
  { value: "progress-25", label: "🏗️ 25% Progress", percent: 25 },
  { value: "progress-50", label: "🎨 50% Progress", percent: 50 },
  { value: "progress-75", label: "💻 75% Progress", percent: 75 },
  { value: "completed", label: "✅ Completed (Final)", percent: 100 },
];

const UNSPLASH_SAMPLES = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop",
];

const UploadPhotoModal = ({ isOpen, onClose, onUpload, editPhoto = null }) => {
  const [stage, setStage] = useState(editPhoto?.tab || "before");
  const [title, setTitle] = useState(editPhoto?.title || "");
  const [desc, setDesc] = useState(editPhoto?.desc || "");
  const [imageUrl, setImageUrl] = useState(editPhoto?.image || "");
  const [previewIdx, setPreviewIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedStageOption = STAGE_OPTIONS.find((s) => s.value === stage) || STAGE_OPTIONS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      const chosenImage = imageUrl.trim() || UNSPLASH_SAMPLES[previewIdx];
      const newPhoto = {
        id: `photo-upload-${Date.now()}`,
        tab: selectedStageOption.value.startsWith("progress") ? "progress" : selectedStageOption.value,
        stage: selectedStageOption.label.split(" ")[1],
        stageLabel: selectedStageOption.label.replace(/^[^\s]+ /, ""),
        stagePercent: selectedStageOption.percent,
        image: chosenImage,
        title: title.trim(),
        desc: desc.trim(),
        uploadDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        uploadedBy: "Principal Suresh Kumar",
        verificationStatus: "pending",
        ngoRemark: null,
        geoCoords: "12.5224° N, 76.8974° E",
      };
      onUpload && onUpload(newPhoto);
      setSubmitting(false);
      onClose();
      // Reset
      setTitle("");
      setDesc("");
      setImageUrl("");
      setStage("before");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h3 className="font-extrabold text-base">
              {editPhoto ? "✏️ Edit / Re-upload Photo" : "📸 Upload Project Photo"}
            </h3>
            <p className="text-blue-200 text-xs mt-0.5">Only School Admin can upload evidence</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Stage Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2">
              Project Stage <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStage(opt.value)}
                  className={`text-left px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    stage === opt.value
                      ? "bg-blue-50 border-blue-600 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                  {stage === opt.value && <span className="ml-2 text-blue-500">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Preview Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2">
              Select Sample Photo (Simulated Upload)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {UNSPLASH_SAMPLES.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setPreviewIdx(idx); setImageUrl(""); }}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    previewIdx === idx && !imageUrl
                      ? "border-blue-600 scale-105 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Or paste a custom image URL below:</p>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Photo Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. New Smart TV Installed in Classroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe what this photo shows and the progress made..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-lg shrink-0">🟡</span>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Uploaded photo will appear with <strong>🟡 Awaiting NGO Verification</strong> status. The NGO inspector will review and either approve or return it for correction.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-full shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
                </svg>
                Uploading...
              </>
            ) : (
              <><span>📸</span> {editPhoto ? "Re-upload Photo" : "Upload & Submit for Verification"}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
