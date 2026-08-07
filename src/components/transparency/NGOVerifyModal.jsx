import React, { useState } from "react";

const NGOVerifyModal = ({ isOpen, onClose, photo, onVerify, onReject }) => {
  const [action, setAction] = useState(null); // "verify" | "reject"
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !photo) return null;

  const handleSubmit = () => {
    if (action === "reject" && !remark.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      if (action === "verify") {
        onVerify && onVerify(photo.id, "NGO Inspector — Shiksha Seva Foundation");
      } else {
        onReject && onReject(photo.id, remark.trim());
      }
      setSubmitting(false);
      setAction(null);
      setRemark("");
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-700 to-teal-600 text-white">
          <div>
            <h3 className="font-extrabold text-base">🔍 NGO Verification Panel</h3>
            <p className="text-emerald-200 text-xs mt-0.5">Shiksha Seva Foundation — Inspector Portal</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Photo Preview */}
          <div className="rounded-[20px] overflow-hidden relative h-52 bg-slate-900 shadow-lg">
            <img src={photo.image} alt={photo.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <p className="font-extrabold text-sm">{photo.title}</p>
              <p className="text-xs text-slate-300">{photo.stageLabel} • Uploaded {photo.uploadDate}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">By: {photo.uploadedBy}</p>
            </div>
            <div className="absolute top-3 right-3 bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full">
              🟡 Awaiting Your Verification
            </div>
          </div>

          {/* Photo Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="text-slate-400 font-medium block">Upload Date</span>
              <span className="font-bold text-slate-800">{photo.uploadDate}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="text-slate-400 font-medium block">Geotag</span>
              <span className="font-mono text-emerald-600 font-bold text-[10px]">{photo.geoCoords}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 col-span-2">
              <span className="text-slate-400 font-medium block">Photo Description</span>
              <span className="font-medium text-slate-700">{photo.desc}</span>
            </div>
          </div>

          {/* Action Selection */}
          {!action && (
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-700">Select Your Verification Action:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAction("verify")}
                  className="h-14 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-700 font-extrabold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-1 hover:shadow-md hover:shadow-emerald-500/10"
                >
                  <span className="text-xl">✅</span>
                  <span className="text-xs">Verify & Approve</span>
                </button>
                <button
                  onClick={() => setAction("reject")}
                  className="h-14 bg-red-50 hover:bg-red-100 border-2 border-red-300 text-red-700 font-extrabold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-1 hover:shadow-md hover:shadow-red-500/10"
                >
                  <span className="text-xl">✗</span>
                  <span className="text-xs">Return for Correction</span>
                </button>
              </div>
            </div>
          )}

          {/* Verify Confirmation */}
          {action === "verify" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="text-sm font-extrabold text-emerald-800 mb-1">✅ Confirm Verification</p>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  You are confirming that this photo accurately reflects the construction progress at the specified location. Your name will be recorded as the verifier.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-full shadow-md shadow-emerald-600/20 transition-all"
                >
                  {submitting ? "Verifying..." : "✅ Confirm — Mark as Verified"}
                </button>
              </div>
            </div>
          )}

          {/* Reject with Remark */}
          {action === "reject" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm font-extrabold text-red-800 mb-1">✗ Return for Correction</p>
                <p className="text-xs text-red-700 leading-relaxed">
                  Provide a clear reason. The School Admin will see this remark and must re-upload the photo.
                </p>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Image is blurry. Please re-upload a clearer photo in good lighting..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !remark.trim()}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-full shadow-md shadow-red-600/20 transition-all"
                >
                  {submitting ? "Submitting..." : "✗ Return to School Admin"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGOVerifyModal;
