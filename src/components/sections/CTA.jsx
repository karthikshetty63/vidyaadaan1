import React from "react";
import Container from "../layout/Container";

const CTA = () => {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-12 bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 relative overflow-hidden text-white">
      {/* Decorative doodle hearts on right */}
      <div className="absolute right-6 bottom-3 opacity-25 pointer-events-none text-6xl">
        ♡ 💕
      </div>

      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Round Kids Image + Headline & Subtitle */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Round Cropped Image */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/30 overflow-hidden shadow-xl shrink-0">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop"
                alt="Smiling children"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-1.5">
                Be the Reason Behind a Child's Smile Today
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm max-w-lg font-medium">
                Your small contribution can bring a big change in their life.
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => scrollTo("#projects")}
              className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-full shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5"
            >
              Donate Now 💙
            </button>
            <button
              onClick={() => scrollTo("#projects")}
              className="px-6 py-3 border-2 border-emerald-300 text-white hover:bg-white/10 font-bold text-xs rounded-full transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5"
            >
              Explore Projects →
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
