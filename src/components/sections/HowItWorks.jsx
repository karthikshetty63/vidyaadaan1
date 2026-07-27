import React from "react";
import Container from "../layout/Container";

const steps = [
  {
    step: 1,
    title: "School Submits a Need",
    description: "School registers and submits required infrastructure needs.",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    step: 2,
    title: "NGO Verifies the Request",
    description: "Our NGO partners verify and approve the needs.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  {
    step: 3,
    title: "Donors Contribute with Love",
    description: "Donors choose a project and contribute securely.",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    step: 4,
    title: "Project Gets Funded",
    description: "Once funded, school starts the implementation.",
    icon: (
      <span className="text-emerald-600 font-extrabold text-base">₹</span>
    ),
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  {
    step: 5,
    title: "Work Completed & Verified",
    description: "NGO verifies the work and school uploads photos.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  {
    step: 6,
    title: "Students Benefit",
    description: "Children get better facilities and a brighter future.",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    bgColor: "bg-blue-50 border-blue-200",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200">
      <Container>
        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-label mb-2 block">HOW VIDYADAAN WORKS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Simple Steps, Lasting Impact
          </h2>
        </div>

        {/* 6 Steps Horizontal Line Flow with step numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center relative group">
              {/* Step number badge above icon */}
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center mb-2">
                {s.step}
              </div>

              {/* Step Icon Circle */}
              <div
                className={`w-13 h-13 rounded-full border-2 ${s.bgColor} flex items-center justify-center mb-3 shadow-2xs group-hover:scale-110 transition-transform duration-300 bg-white`}
              >
                {s.icon}
              </div>

              {/* Title & description */}
              <h3 className="text-xs font-extrabold text-slate-900 mb-1 leading-snug">
                {s.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-normal max-w-[150px]">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
