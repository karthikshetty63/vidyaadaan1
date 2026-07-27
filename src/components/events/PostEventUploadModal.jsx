import React, { useState } from "react";

const inputCls = "w-full h-11 px-4 border-2 border-slate-200 rounded-xl text-xs focus:border-emerald-500 focus:outline-none transition-colors font-medium";

const PostEventUploadModal = ({ isOpen, onClose, event, onSubmitReport }) => {
  const [form, setForm] = useState({
    thankYouMessage: "",
    studentsBenefited: "",
    beforePhoto: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop",
    prepPhoto: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop",
    eventPhoto: "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=400&auto=format&fit=crop",
    completionPhoto: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !event) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSubmitReport) {
      onSubmitReport({
        eventId: event.id,
        thankYouMessage: form.thankYouMessage || "Thank you for your generous support!",
        studentsBenefited: Number(form.studentsBenefited) || event.expectedStudents,
        photos: [form.beforePhoto, form.prepPhoto, form.eventPhoto, form.completionPhoto],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1">
              <span>📸</span> Post-Event Completion Report
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto animate-bounce">
              ✅
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Completion Report Uploaded!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you! Your event report and photos have been verified and sent to all donors & NGO partners.
              </p>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-emerald-600/25 transition-all"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Actual Students Benefited *</label>
              <input
                type="number"
                required
                value={form.studentsBenefited}
                onChange={(e) => setForm({ ...form, studentsBenefited: e.target.value })}
                placeholder={`e.g. ${event.expectedStudents}`}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thank You Message for Donors & NGOs *</label>
              <textarea
                required
                rows={3}
                value={form.thankYouMessage}
                onChange={(e) => setForm({ ...form, thankYouMessage: e.target.value })}
                placeholder="Express your gratitude to sponsors and share key highlights..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xs font-medium focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Photo URLs */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700">Upload Event Photos (Before, Preparation, Celebration, Completion):</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "beforePhoto", label: "1. Before Photo URL" },
                  { key: "prepPhoto", label: "2. Preparation Photo URL" },
                  { key: "eventPhoto", label: "3. Event Day Photo URL" },
                  { key: "completionPhoto", label: "4. Prize Distribution Photo URL" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-emerald-600/25 transition-all"
              >
                🚀 Submit Completion Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostEventUploadModal;
