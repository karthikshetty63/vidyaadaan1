import React from "react";
import Container from "../layout/Container";

const Hero = () => {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white pt-20 pb-12 overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[85vh] py-8">

          {/* ── LEFT COLUMN: Content (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
              <span className="text-red-500 text-xs">💖</span>
              <span>Together, We Can Build a Better Tomorrow</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                Together, We Can<br />
                Build Better<br />
                <span className="text-blue-600">
                  Government Schools
                </span>
              </h1>
              <p className="handwritten text-2xl sm:text-3xl text-emerald-500 font-bold mt-2.5">
                Every Child Deserves a Better Classroom
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
              VIDYADAAN connects Government Schools, NGOs, and Donors to bridge the gap in rural education through transparent donations and measurable impact.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Primary Blue Button */}
              <button
                onClick={() => scrollTo("#projects")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full transition-all duration-200 shadow-md shadow-blue-500/25 active:scale-[0.98]"
              >
                <span className="text-xs">💙</span>
                Support a School
              </button>

              {/* Secondary Green Outline Button */}
              <button
                onClick={() => scrollTo("#contact")}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-xs rounded-full transition-all duration-200 active:scale-[0.98]"
              >
                <span className="text-xs">🌱</span>
                Register Your School
              </button>
            </div>

            {/* Social Proof Donors Row */}
            <div className="flex items-center gap-3 pt-3">
              <div className="flex items-center">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="donor"
                    className={`w-7 h-7 rounded-full border-2 border-white object-cover shadow-2xs ${
                      i !== 0 ? "-ml-2" : ""
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-slate-900">1,842+</span>{" "}
                <span className="text-slate-500 font-medium">Kind Hearts Already Joined</span>{" "}
                <span className="text-red-500 text-xs">💖</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: School Image & Overlays (5 cols) ── */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Background Decorative Vector Dotted Circles */}
            <div className="absolute -top-6 -left-6 w-48 h-48 rounded-full border-2 border-dashed border-blue-300 opacity-60 pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-60 h-60 rounded-full border-2 border-dashed border-blue-200 opacity-40 pointer-events-none" />

            <div className="relative w-full max-w-md">
              {/* Main Photo Frame */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img
                  src="/images/hero/government-school-students.jpg"
                  alt="Government School Students"
                  className="w-full h-80 sm:h-96 lg:h-[420px] object-cover object-top"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* Floating Top-Right White Card */}
              <div className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 w-56 animate-float z-10">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                    📘
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">Library Upgrade</span>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">💚</span>
                  <span className="text-xs font-black text-slate-900">₹ 1,25,000</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Raised</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "72%" }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-700">1,842 Donors</span>
                  </div>
                  <span className="font-black text-blue-600">72%</span>
                </div>

                {/* School & NGO Details */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-800">
                    <span>🏫</span> Government School
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium pl-4">
                    Mandya District, Karnataka
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full self-start">
                    ✓ Verified by NGO
                  </div>
                </div>
              </div>

              {/* Floating Bottom-Left Emerald Heart Button */}
              <div
                className="absolute -bottom-4 -left-4 w-11 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform hover:scale-110 cursor-pointer z-10"
                onClick={() => scrollTo("#projects")}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Hero;
