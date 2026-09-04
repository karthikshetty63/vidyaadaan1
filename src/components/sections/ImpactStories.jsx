import React from "react";
import Container from "../layout/Container";

const ImpactStories = () => {
  return (
    <section id="stories" className="py-20 bg-slate-50 border-t border-slate-200">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label mb-2 block">REAL IMPACT STORIES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              From Challenges to Change
            </h2>
          </div>
          <a
            href="#projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 px-4 py-2 rounded-full transition-colors shadow-2xs self-start sm:self-auto"
          >
            View All Stories →
          </a>
        </div>

        {/* Story Card Container matching reference image */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* Left Side: BEFORE / AFTER split photo container (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 relative bg-slate-900 min-h-[300px]">
            {/* BEFORE Image */}
            <div className="relative h-full border-r border-white/20">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop"
                alt="Before school condition"
                className="w-full h-full object-cover opacity-85 grayscale contrast-125"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider shadow">
                BEFORE
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-xs text-white text-xs p-2.5 rounded-lg leading-tight font-medium">
                Broken roof, damaged benches and no library.
              </div>
            </div>

            {/* Drag Handle Circle Divider in Middle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-xl z-10 border border-slate-200">
              ⟨⟩
            </div>

            {/* AFTER Image */}
            <div className="relative h-full">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop"
                alt="After school condition"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider shadow">
                AFTER
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-xs text-white text-xs p-2.5 rounded-lg leading-tight font-medium">
                New roof, smart classroom, books and happy students.
              </div>
            </div>
          </div>

          {/* Right Side: Details & Metrics (5 cols) */}
          <div className="lg:col-span-5 p-8 flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                Government Higher Primary School
              </h3>
              <p className="text-xs text-slate-500 font-semibold mb-4">
                Kodagu District, Karnataka
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Thanks to generous donors and NGO support, this school now has a smart classroom, clean toilets and a digital learning lab.
              </p>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-100 mb-6">
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900">₹2,40,000</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Raised</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900">236</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Donors</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-emerald-600">100%</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Completed</div>
                </div>
              </div>
            </div>

            <div>
              <button className="px-5 py-2.5 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-xs rounded-full transition-colors">
                View Full Story
              </button>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default ImpactStories;
