import React from "react";

const SaaSQuickAction = ({ icon, label, onClick, bg = "bg-blue-50 text-blue-700 border-blue-200" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-[20px] border-2 ${bg} shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 group active:scale-[0.98]`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs font-extrabold leading-tight">{label}</span>
    </button>
  );
};

export default SaaSQuickAction;
