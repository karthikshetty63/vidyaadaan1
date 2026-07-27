import React from "react";
import Container from "../layout/Container";

const stats = [
  {
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    circleBg: "bg-blue-50 text-blue-600",
    value: "500+",
    label: "Government Schools Connected",
  },
  {
    icon: (
      <span className="text-emerald-600 font-black text-xl">₹</span>
    ),
    circleBg: "bg-emerald-50 text-emerald-600",
    value: "₹50L+",
    label: "Donations Raised Till Now",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    circleBg: "bg-blue-50 text-blue-600",
    value: "20,000+",
    label: "Students Benefited",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
    circleBg: "bg-emerald-50 text-emerald-600",
    value: "150+",
    label: "NGO Partners Working Together",
  },
];

const Stats = () => {
  return (
    <section className="relative z-30 pb-16 bg-white">
      <Container>
        {/* Floating Card Container Overlapping Hero (rounded-24px, soft shadow) */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl shadow-blue-950/8 p-6 sm:p-8 -mt-12 sm:-mt-16 relative z-30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 ${
                  i !== 0 ? "sm:pl-6 pt-4 sm:pt-0" : ""
                }`}
              >
                {/* Large Centered Round Circle Icon */}
                <div
                  className={`w-14 h-14 rounded-full ${s.circleBg} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  {s.icon}
                </div>

                {/* Metric text */}
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold leading-snug mt-0.5 max-w-[140px]">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Stats;
