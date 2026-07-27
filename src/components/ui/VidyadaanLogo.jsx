import React from "react";

export const LogoEmblem = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Mortarboard Graduation Cap */}
    <path
      d="M24 4L41 10.5L24 17L7 10.5L24 4Z"
      fill="none"
      stroke="#0B192C"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path
      d="M13 13V18.5C13 21 18 23 24 23C30 23 35 21 35 18.5V13"
      fill="none"
      stroke="#0B192C"
      strokeWidth="2.8"
    />
    {/* Cap Tassel */}
    <path d="M37 11.5V20" stroke="#0B192C" strokeWidth="2" strokeLinecap="round" />
    <circle cx="37" cy="21.5" r="1.8" fill="#0B192C" />

    {/* Student Figure (Orange) */}
    <circle cx="24" cy="24.5" r="2.8" fill="#FF6B00" />
    <path
      d="M17 28.5C19.5 30 24 34 24 34C24 34 28.5 30 31 28.5C28.5 27 24 27 24 27C24 27 19.5 27 17 28.5Z"
      fill="#FF6B00"
    />

    {/* Open Book Wings (Orange Accent) */}
    <path
      d="M10 32C15 29.5 19.5 30.5 24 32.5C28.5 30.5 33 29.5 38 32"
      fill="none"
      stroke="#FF6B00"
      strokeWidth="3.2"
      strokeLinecap="round"
    />

    {/* Open Book Outer Pages (Navy Blue Layers) */}
    <path
      d="M6 36.5C13 33 18.5 34.5 24 36.5C29.5 34.5 35 33 42 36.5"
      fill="none"
      stroke="#0B192C"
      strokeWidth="3.8"
      strokeLinecap="round"
    />
    <path
      d="M4 41.5C12 37.5 18 39 24 41.5C30 39 36 37.5 44 41.5"
      fill="none"
      stroke="#0B192C"
      strokeWidth="4.2"
      strokeLinecap="round"
    />
  </svg>
);

const VidyadaanLogo = ({ variant = "dark", showTagline = true, className = "" }) => {
  const isDarkBg = variant === "light"; // White text for dark backgrounds (e.g. Footer)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblem Icon in Circle Badge */}
      <div className="w-11 h-11 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center p-1.5 shrink-0 hover:scale-105 transition-transform">
        <LogoEmblem className="w-full h-full" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-black text-lg tracking-wider ${
            isDarkBg ? "text-white" : "text-[#0B192C]"
          }`}
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          Vi<span className="text-[#FF6B00]">D</span>YA<span className="text-[#FF6B00]">D</span>AAN
        </span>
        {showTagline && (
          <span className="text-[10px] text-emerald-600 font-bold tracking-tight">
            Empowering Education Across India
          </span>
        )}
      </div>
    </div>
  );
};

export default VidyadaanLogo;
