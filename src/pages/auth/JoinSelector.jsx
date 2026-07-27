import React from "react";
import { Link } from "react-router-dom";

const joinRoles = [
  {
    key: "school",
    emoji: "🏫",
    title: "Register School",
    description: "Bring your school to thousands of NGOs and donors. Get funding for infrastructure, libraries, labs and more.",
    button: "Register School",
    href: "/join/school",
    gradient: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    btnClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="24" width="48" height="32" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
        <path d="M4 28L32 10L60 28" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <rect x="22" y="38" width="8" height="18" rx="2" fill="#BFDBFE" />
        <rect x="34" y="38" width="8" height="18" rx="2" fill="#BFDBFE" />
        <rect x="26" y="28" width="4" height="4" rx="1" fill="#3B82F6" />
        <rect x="34" y="28" width="4" height="4" rx="1" fill="#3B82F6" />
        <path d="M29 12V6" stroke="#F59E0B" strokeWidth="2" />
        <path d="M32 6L36 8L32 10L28 8L32 6Z" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    key: "ngo",
    emoji: "🤝",
    title: "Register NGO",
    description: "Partner with verified government schools, manage projects and volunteers, and create lasting educational impact.",
    button: "Register NGO",
    href: "/join/ngo",
    gradient: "from-emerald-50 to-emerald-100",
    border: "border-emerald-200",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="22" r="10" fill="#D1FAE5" stroke="#10B981" strokeWidth="2" />
        <path d="M20 22c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,2" />
        <path d="M16 46c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#A7F3D0" stroke="#10B981" strokeWidth="2" />
        <path d="M26 22l4 4 8-8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 52h28" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "donor",
    emoji: "💙",
    title: "Register as Donor",
    description: "Support verified government schools across India and track every contribution with complete transparency.",
    button: "Register as Donor",
    href: "/join/donor",
    gradient: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    btnClass: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <path d="M32 54L13 35C7 29 7 19 16 15c4-2 9-1 12 2l4 3 4-3c3-3 8-4 12-2 9 4 9 14 3 20L32 54z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
        <path d="M24 26c2-3 7-4 10-2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M30 32h8M30 36h5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const JoinSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col">
      {/* Mini Navbar */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-sm text-slate-900">VIDYADAAN</span>
            <span className="text-[9px] text-emerald-600 font-bold">Empowering Education Across India</span>
          </div>
        </Link>
        <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors">← Back to Home</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-6">
              <span>🌱</span> Join the Movement
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Join <span className="text-blue-600">VIDYADAAN</span>
            </h1>
            <p className="text-slate-500 text-base max-w-md mx-auto">
              Become part of India's school transformation movement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {joinRoles.map((role) => (
              <div key={role.key}
                className={`bg-gradient-to-b ${role.gradient} border ${role.border} rounded-[24px] p-8 flex flex-col items-center text-center gap-5 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl group`}>
                <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  {role.icon}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-2">{role.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{role.description}</p>
                </div>
                <Link to={role.href}
                  className={`w-full h-12 flex items-center justify-center text-sm font-bold text-white rounded-full transition-all duration-200 shadow-xl ${role.btnClass} active:scale-[0.98]`}>
                  {role.button}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-10">
            Already registered?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default JoinSelector;
