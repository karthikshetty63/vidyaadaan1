import React from "react";
import Container from "../layout/Container";

const WhySection = () => {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="why" className="py-20 lg:py-28 bg-white relative cloud-glow-why overflow-hidden">
      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-10">

          {/* ── LEFT SIDE: Text & Features (Approx 45% width) ── */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center gap-6">
            <div>
              <span className="section-label mb-2 block font-extrabold tracking-widest">WHY VIDYADAAN EXISTS</span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                Education Changes Lives,<br />
                But <span className="text-emerald-600">Schools Need Support</span>
              </h2>
            </div>

            {/* Description (Max width 520px) */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-[520px]">
              Many rural government schools lack basic facilities like classrooms, toilets, libraries, digital tools and safe drinking water. Your support can bring these essential changes to life.
            </p>

            {/* 3 Features Grid (Horizontal Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 font-bold">
                    🛡️
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Transparent</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">
                  100% transparency in every donation
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 font-bold">
                    ✓
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Verified</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">
                  Every school & project verified by NGOs
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 font-bold">
                    📊
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Accountable</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">
                  Updates & photos till project completion
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => scrollTo("#projects")}
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-xl shadow-blue-600/20 active:scale-[0.98]"
              >
                Learn More About Us
              </button>
            </div>
          </div>

          {/* ── RIGHT SIDE: Image with Brush Edge Mask & Floating Quote Card (Approx 55% width) ── */}
          <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px]">

              {/* Artistic Brush-edge Image Container */}
              <div className="brush-edge-container bg-slate-100 border-4 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop"
                  alt="Rural School Students Walking"
                  className="w-full h-[360px] sm:h-[440px] object-cover"
                />
              </div>

              {/* Floating Quote Card Overlapping Image (Exact match to Image 2) */}
              <div className="absolute -bottom-6 -right-2 sm:right-4 bg-white rounded-[20px] p-5 shadow-2xl shadow-blue-950/15 border border-slate-100 max-w-xs z-20">
                <div className="text-emerald-500 font-serif text-3xl leading-none mb-1">“</div>
                <p className="text-xs sm:text-sm text-slate-800 font-bold italic leading-relaxed mb-3">
                  We dream of a better school where every child can learn, grow and achieve.
                </p>
                <div className="text-[11px] font-semibold text-slate-500">
                  – Students of Govt. School Honnali Village
                </div>

                {/* Bottom-Right Floating Green Heart Icon */}
                <div className="absolute -bottom-3 -right-3 w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  💚
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default WhySection;
