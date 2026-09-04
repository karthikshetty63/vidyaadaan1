import React, { useState } from "react";
import { getAmountRemaining } from "../../utils/funding";

const SponsorNeedModal = ({ isOpen, onClose, need, onDonateSuccess }) => {
  const [amount, setAmount] = useState(2500);
  const [donorName, setDonorName] = useState("Ramesh Kumar");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !need) return null;

  const { label, schoolName, district, amount: targetCost, progress = 0, icon = "📋" } = need;
  const targetNum = typeof targetCost === "number" ? targetCost : parseInt(targetCost.replace(/[^0-9]/g, "")) || 45000;
  const raised = Math.round((targetNum * progress) / 100);
  const remaining = getAmountRemaining(targetNum, raised);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onDonateSuccess) {
      onDonateSuccess({
        needLabel: label,
        schoolName,
        donorName,
        amount: Number(amount) || 1000,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1">
              <span>📋</span> Direct School Need Donation
            </div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span>{icon}</span> {label}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">🏫 {schoolName} ({district})</p>
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
              💙
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Thank You for Fulfilling School Needs!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your donation of <strong>₹{Number(amount).toLocaleString("en-IN")}</strong> for <strong>{label}</strong> at <strong>{schoolName}</strong> has been received with gratitude.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-semibold max-w-sm mx-auto">
              📜 An 80G Tax Receipt and progress updates will be added to your donor dashboard!
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Need Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Target Required: ₹{targetNum.toLocaleString("en-IN")}</span>
                <span className="text-blue-600">{progress}% Funded</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 text-right">
                Remaining needed: <strong>₹{remaining.toLocaleString("en-IN")}</strong>
              </p>
            </div>

            {/* Donor Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Donor Name *</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Amount presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Donation Amount (₹) *</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[1000, 2500, 5000, 10000, remaining].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${Number(amount) === preset
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                      }`}
                  >
                    {preset === remaining ? `Full Amount (₹${remaining.toLocaleString("en-IN")})` : `₹${preset.toLocaleString("en-IN")}`}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full h-12 pl-8 pr-4 border-2 border-slate-200 rounded-xl text-base font-extrabold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
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
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all"
              >
                💙 Confirm ₹{Number(amount || 0).toLocaleString("en-IN")} Donation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SponsorNeedModal;
