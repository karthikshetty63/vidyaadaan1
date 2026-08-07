import React, { useState } from "react";

const STAGE_OPTIONS = [
  { value: "before", label: "📷 Before Photos (Initial State)", defaultPct: 0 },
  { value: "working-25", label: "🏗 Working Photos (25% Milestone)", defaultPct: 25 },
  { value: "working-50", label: "🏗 Working Photos (50% Milestone)", defaultPct: 50 },
  { value: "working-75", label: "🏗 Working Photos (75% Milestone)", defaultPct: 75 },
  { value: "completed", label: "✅ Completion Photos (100% Final)", defaultPct: 100 },
];

const SAMPLE_PHOTO_PREVIEWS = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop",
];

const AddProgressUpdateModal = ({ isOpen, onClose, onAddUpdate }) => {
  const [stage, setStage] = useState("working-50");
  const [progressPct, setProgressPct] = useState(50);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [sampleIdx, setSampleIdx] = useState(0);
  const [status, setStatus] = useState("Awaiting NGO Verification");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStageChange = (val) => {
    setStage(val);
    const matched = STAGE_OPTIONS.find((s) => s.value === val);
    if (matched) setProgressPct(matched.defaultPct);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      const chosenImage = customPhotoUrl.trim() || SAMPLE_PHOTO_PREVIEWS[sampleIdx];
      const stageCategory = stage.startsWith("working") ? "working" : stage;
      
      const newUpdate = {
        id: `update-${Date.now()}`,
        stageCategory, // "before" | "working" | "completed"
        stageLabel: STAGE_OPTIONS.find((s) => s.value === stage)?.label.split(" ")[1] || "Progress",
        progressPct: Number(progressPct),
        title: title.trim(),
        desc: desc.trim(),
        image: chosenImage,
        uploadDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        uploadedBy: "School Admin",
        verificationStatus: "pending", // "pending" | "verified" | "rejected"
        ngoRemark: null,
      };

      onAddUpdate && onAddUpdate(newUpdate);
      setSubmitting(false);
      onClose();
      // reset
      setTitle("");
      setDesc("");
      setCustomPhotoUrl("");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-6 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              🏫 School Admin Portal
            </span>
            <h3 className="font-extrabold text-lg mt-1">➕ Add Progress Update</h3>
            <p className="text-xs text-blue-100">Upload evidence photo & milestone progress</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Stage Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              Select Progress Stage <span className="text-red-500">*</span>
            </label>
            <div className="space-y-1.5">
              {STAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStageChange(opt.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    stage === opt.value
                      ? "bg-blue-50 border-blue-600 text-blue-800 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{opt.label}</span>
                  {stage === opt.value && <span className="text-blue-600 font-extrabold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Progress % Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-extrabold text-slate-800">
              <span>Overall Progress Completion:</span>
              <span className="text-blue-600 font-black text-sm">{progressPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPct}
              onChange={(e) => setProgressPct(e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Title & Desc */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Update Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Concrete plastering and electrical wiring complete"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Description & Milestone Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide details about work executed, materials used, and contractor status..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Upload Photo Selection */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-extrabold text-slate-800">
              📸 Upload Evidence Photo <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SAMPLE_PHOTO_PREVIEWS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setSampleIdx(idx); setCustomPhotoUrl(""); }}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    sampleIdx === idx && !customPhotoUrl
                      ? "border-blue-600 scale-105 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img src={url} alt="sample" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="Or paste custom image URL (https://...)"
              value={customPhotoUrl}
              onChange={(e) => setCustomPhotoUrl(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Alert Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-semibold leading-relaxed">
            🟡 <strong>NGO Audit Notice:</strong> Uploaded updates will be marked as <strong>Awaiting NGO Verification</strong>. The assigned NGO Auditor will review and approve the milestone.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-md transition-all"
            >
              {submitting ? "Uploading Update..." : "📸 Upload Progress Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgressUpdateModal;
