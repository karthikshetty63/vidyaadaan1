import React from "react";
import Container from "../layout/Container";

const WhySection = () => {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="why" className="py-20 bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Features (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <span className="section-label mb-2 block">WHY VIDYADAAN EXISTS</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Education Changes Lives,<br />
                But <span className="text-emerald-600">Schools Need Support</span>
              </h2>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
              Many rural government schools lack basic facilities like classrooms, toilets, libraries, digital tools and safe drinking water. Your support can bring these essential changes to life.
            </p>

            {/* 3 Features Grid (Horizontal Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                    🛡️
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Transparent</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  100% transparency in every donation
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Verified</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  Every school & project verified by NGOs
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                    📊
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900">Accountable</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  Updates & photos till project completion
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => scrollTo("#projects")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-[0.98]"
              >
                Learn More About Us
              </button>
            </div>
          </div>

          {/* Right Column: Image with Wave Mask & Floating Quote Card (6 cols) */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Organic wave mask photo */}
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop"
                  alt="Rural Government School Students"
                  className="w-full h-80 sm:h-96 lg:h-[400px] object-cover"
                />
              </div>

              {/* Floating Quote Card on bottom-right of photo */}
              <div className="absolute -bottom-6 -right-2 sm:right-4 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 max-w-xs z-10">
                <div className="text-emerald-500 font-serif text-3xl leading-none mb-1">“</div>
                <p className="text-xs text-slate-800 font-bold italic leading-relaxed mb-3">
                  We dream of a better school where every child can learn, grow and achieve.
                </p>
                <div className="text-[11px] font-semibold text-slate-500">
                  – Students of Govt. School Honnali Village
                </div>

                {/* Bottom-Right Floating Green Heart Button */}
                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
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
