import React from "react";

const ChildCard = ({ child }) => {
  const { name, dream, schoolNeed, image, needIcon = "🔬", cardBg = "bg-blue-50/70" } = child;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Photo with small green checkmark badge at bottom-left */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />

        {/* Small green checkmark badge at bottom-left of photo */}
        <div className="absolute bottom-2.5 left-2.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-md">
          ✓
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">{name}</h3>
          <p className="text-xs text-slate-600 font-medium leading-snug">
            <span className="font-bold text-slate-800">Dream:</span> {dream}
          </p>
        </div>

        {/* School Need Box at bottom of card */}
        <div className={`p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between ${cardBg}`}>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold">
              School Need:
            </div>
            <div className="text-xs font-bold text-slate-900">{schoolNeed}</div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-2xs">
            {needIcon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildCard;
