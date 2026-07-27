import React from "react";
import Container from "../layout/Container";

const Hero = () => {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-white pt-24 pb-16 lg:pb-24 overflow-hidden cloud-glow-bg">
      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 min-h-[82vh]">

          {/* ── LEFT SIDE (Approx 45% Width) ── */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
              <span className="text-red-500 text-xs">💖</span>
              <span>Together, We Can Build a Better Tomorrow</span>
            </div>

            {/* Large Heading */}
            <div className="flex flex-col">
              <h1 className="hero-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight">
                Together, We Can<br />
                Build Better<br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Government Schools
                </span>
              </h1>
              <p className="handwritten text-2xl sm:text-3xl text-emerald-500 font-bold mt-3">
                Every Child Deserves a Better Classroom
              </p>
            </div>

            {/* Description (max-width 520px) */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-[520px]">
              VIDYADAAN connects Government Schools, NGOs, and Donors to bridge the gap in rural education through transparent donations and measurable impact.
            </p>

            {/* CTA Buttons (56px height, rounded-full) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary Blue Gradient Button */}
              <button
                onClick={() => scrollTo("#projects")}
                className="flex items-center gap-2.5 h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm rounded-full transition-all duration-200 shadow-xl shadow-blue-600/25 active:scale-[0.98]"
              >
                <span className="text-sm">💙</span>
                Support a School
              </button>

              {/* Secondary White Button with Green Border */}
              <button
                onClick={() => scrollTo("#contact")}
                className="flex items-center gap-2.5 h-14 px-8 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-sm rounded-full transition-all duration-200 active:scale-[0.98] shadow-2xs"
              >
                <span className="text-sm">🌱</span>
                Register Your School
              </button>
            </div>

            {/* Avatar Row */}
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
                    alt="donor avatar"
                    className={`w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs ${
                      i !== 0 ? "-ml-2.5" : ""
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-extrabold text-slate-900">1,842+</span>{" "}
                <span className="text-slate-500 font-medium">Kind Hearts Already Joined</span>{" "}
                <span className="text-red-500">💖</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE (Approx 55% Width) ── */}
          <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end">

            {/* Background Dashed Swirl Vector Line */}
            <svg className="absolute -top-10 -left-8 w-40 h-40 text-blue-300/70 opacity-80 pointer-events-none" fill="none" viewBox="0 0 100 100">
              <path d="M10,80 Q40,10 90,50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,4" />
              <polygon points="88,44 96,52 86,54" fill="currentColor" />
            </svg>

            {/* Decorative Vector Shapes */}
            <div className="absolute top-10 left-0 text-blue-500 text-lg animate-float pointer-events-none">💙</div>
            <div className="absolute -bottom-4 right-16 text-teal-400 text-base animate-float pointer-events-none" style={{ animationDelay: "1.2s" }}>✦</div>
            <div className="absolute top-4 right-1/3 text-emerald-400 text-sm animate-float pointer-events-none" style={{ animationDelay: "2s" }}>✨</div>

            <div className="relative w-full max-w-[560px]">

              {/* Clean Transparent Hero Image Frame (Using clean local government-school-students.jpg) */}
              <div className="rounded-[32px] overflow-hidden shadow-2xl shadow-blue-900/15">
                <img
                  src="/images/hero/government-school-students.jpg"
                  alt="Government School Students"
                  className="w-full h-[360px] sm:h-[460px] lg:h-[500px] object-cover object-top rounded-[32px]"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* Floating Donation Card (Top Right) */}
              <div className="absolute -top-6 -right-4 sm:-right-8 bg-white rounded-[20px] p-4 sm:p-5 shadow-2xl shadow-blue-950/15 border border-slate-100/90 w-64 sm:w-72 animate-float z-20">
                {/* Title Row */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shadow-2xs">
                    📘
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">Library Upgrade</span>
                </div>

                {/* Amount Row */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">💚</span>
                  <span className="text-sm sm:text-base font-black text-slate-900">₹ 1,25,000</span>
                  <span className="text-[11px] text-slate-400 font-medium">Raised</span>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: "72%" }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-[9px]">👥</span>
                    <span className="font-bold text-slate-700">1,842 Donors</span>
                  </div>
                  <span className="font-black text-emerald-600">72%</span>
                </div>

                {/* School Details & Verification */}
                <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                    <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">🏫</span>
                    <span>Government School</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium pl-5">
                    Mandya District, Karnataka
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full self-start">
                    ✓ Verified by NGO
                  </div>
                </div>
              </div>

              {/* Floating Bottom-Left Emerald Heart Button */}
              <div
                className="absolute -bottom-5 -left-4 sm:-left-6 w-13 h-13 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xl shadow-teal-500/30 transition-transform hover:scale-110 cursor-pointer z-20"
                onClick={() => scrollTo("#projects")}
                aria-label="Support project"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
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
