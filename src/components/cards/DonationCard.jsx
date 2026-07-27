import React, { useState } from "react";

const presets = [500, 1000, 2500, 5000];

const DonationCard = ({ className = "" }) => {
  const [selected, setSelected] = useState(1000);
  const [custom, setCustom] = useState("");

  const amount = custom ? parseInt(custom) || 0 : selected;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex flex-col gap-5 ${className}`}
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">Make a Donation</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          100% goes to verified school projects
        </p>
      </div>

      {/* Preset Amounts */}
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">
          Select Amount
        </p>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => {
                setSelected(p);
                setCustom("");
              }}
              className={`text-sm font-bold py-2 rounded-xl border-2 transition-all duration-200 ${
                selected === p && !custom
                  ? "bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-500/20"
                  : "border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600"
              }`}
            >
              ₹{p.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">
          Custom Amount
        </p>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
            ₹
          </span>
          <input
            type="number"
            min="1"
            placeholder="Enter amount"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setSelected(null);
            }}
            className="w-full border-2 border-slate-200 focus:border-sky-500 outline-none rounded-xl pl-8 pr-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Impact note */}
      {amount >= 500 && (
        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 text-xs text-sky-700 font-medium">
          💡 ₹{amount.toLocaleString("en-IN")} can fund{" "}
          {amount >= 5000
            ? "a full STEM kit for 4 students"
            : amount >= 2500
            ? "digital textbooks for 8 students"
            : amount >= 1000
            ? "one month of tuition for 2 children"
            : "school uniform & kit for 1 child"}
        </div>
      )}

      {/* Donate Button */}
      <button className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-sky-500/25">
        Donate ₹{amount > 0 ? amount.toLocaleString("en-IN") : "—"} Now →
      </button>

      {/* Tax benefit */}
      <p className="text-center text-xs text-slate-400 -mt-2">
        🔒 Secure payment · 80G tax exemption certificate provided
      </p>
    </div>
  );
};

export default DonationCard;
