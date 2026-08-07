import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Container from "../components/layout/Container";

// ── Platform-wide transparency stats ───────────────────────────────────────
const PLATFORM_STATS = [
  { icon: "🏫", value: "350+", label: "Schools Verified", sub: "UDISE-verified govt. schools", color: "from-blue-600 to-blue-500" },
  { icon: "₹", value: "12.5 Cr+", label: "Funds Deployed", sub: "Via ring-fenced escrow", color: "from-emerald-600 to-teal-500" },
  { icon: "📸", value: "18,400+", label: "Photos Verified", sub: "NGO-inspected evidence", color: "from-violet-600 to-purple-500" },
  { icon: "🎒", value: "50,000+", label: "Children Benefited", sub: "Across 12 states", color: "from-amber-500 to-orange-500" },
  { icon: "✅", value: "100%", label: "NGO Verified", sub: "Every milestone checked", color: "from-rose-500 to-pink-500" },
  { icon: "📜", value: "4,200+", label: "80G Receipts", sub: "Auto-generated & QR-coded", color: "from-cyan-600 to-sky-500" },
];

// ── How money flows ─────────────────────────────────────────────────────────
const MONEY_FLOW = [
  {
    step: "01",
    icon: "❤️",
    title: "Donor Donates",
    desc: "You choose a school project and donate. Amount is instantly ring-fenced in a dedicated escrow account — never touches the NGO or school's main account.",
    color: "bg-blue-600",
    border: "border-blue-200",
    bg: "bg-blue-50",
  },
  {
    step: "02",
    icon: "🏛️",
    title: "Escrow Holds Funds",
    desc: "Your money is locked in a SEBI-compliant escrow. It can ONLY be released milestone-by-milestone after NGO inspector physically verifies the work.",
    color: "bg-emerald-600",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
  },
  {
    step: "03",
    icon: "🤝",
    title: "NGO Verifies Work",
    desc: "An independent NGO inspector visits the school, reviews geotagged photos, and digitally approves each stage. No approval = no fund release.",
    color: "bg-violet-600",
    border: "border-violet-200",
    bg: "bg-violet-50",
  },
  {
    step: "04",
    icon: "🏪",
    title: "Vendor Gets Paid",
    desc: "Funds are released directly to the government-empanelled vendor — never to the school admin. Full payment audit trail is publicly visible.",
    color: "bg-amber-600",
    border: "border-amber-200",
    bg: "bg-amber-50",
  },
  {
    step: "05",
    icon: "📜",
    title: "80G Receipt Issued",
    desc: "You receive an auto-generated 80G tax certificate with QR code verification within 24 hours. Download anytime from your donor dashboard.",
    color: "bg-rose-600",
    border: "border-rose-200",
    bg: "bg-rose-50",
  },
];

// ── Sample verified projects ────────────────────────────────────────────────
const SAMPLE_PROJECTS = [
  {
    id: "proj-1",
    title: "Smart Classroom Setup",
    school: "GHS Mysuru North",
    district: "Mysuru, Karnataka",
    udise: "29260104604",
    ngo: "ShikshaDaan Foundation",
    raised: 480000,
    target: 600000,
    donors: 47,
    children: 312,
    status: "in-progress",
    verifiedStages: 9,
    totalStages: 16,
    badge: "🏫",
  },
  {
    id: "proj-2",
    title: "Science Lab Renovation",
    school: "Govt. Primary, Hubli",
    district: "Dharwad, Karnataka",
    udise: "29050301903",
    ngo: "VidyaPath NGO",
    raised: 220000,
    target: 220000,
    donors: 31,
    children: 185,
    status: "completed",
    verifiedStages: 16,
    totalStages: 16,
    badge: "🔬",
  },
  {
    id: "proj-3",
    title: "Girls Sanitation Block",
    school: "GHS Kolar Girls",
    district: "Kolar, Karnataka",
    udise: "29190205801",
    ngo: "Swabhimaan Trust",
    raised: 95000,
    target: 350000,
    donors: 12,
    children: 420,
    status: "funding",
    verifiedStages: 2,
    totalStages: 16,
    badge: "🚻",
  },
];

// ── Compliance badges ───────────────────────────────────────────────────────
const COMPLIANCE = [
  { icon: "🏦", label: "Escrow Partner", name: "HDFC Bank Nodal A/c" },
  { icon: "📋", label: "Regulator", name: "SEBI-Compliant Structure" },
  { icon: "🧾", label: "Tax", name: "FCRA + 80G + 12A Registered" },
  { icon: "🔍", label: "Audit", name: "Big-4 Chartered Accountant" },
  { icon: "🏛️", label: "NGO Accreditation", name: "GuideStar India Certified" },
  { icon: "🔒", label: "Data Security", name: "ISO 27001 Compliant" },
];

// ── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Can I see exactly where my money went?",
    a: "Yes. Every rupee is traceable. Your donor dashboard shows a full ledger — which school, which vendor, which milestone, on which date.",
  },
  {
    q: "What happens if a project fails mid-way?",
    a: "Unspent escrow funds are returned to donors or re-allocated (with your consent) to another verified project. No money is ever retained by the platform.",
  },
  {
    q: "Who are the NGO inspectors?",
    a: "All NGO partners are FCRA-registered, GuideStar-certified organizations with a clean audit track record. They are contractually bound to conduct physical site visits.",
  },
  {
    q: "Are the school photos authentic?",
    a: "All photos are geotagged, timestamped, and uploaded only by the designated School Admin with UDISE verification. NGO separately cross-checks and digitally approves each upload.",
  },
  {
    q: "How is the 80G receipt generated?",
    a: "Our system auto-generates a legally valid 80G tax receipt with a unique QR code within 24 hours of payment confirmation. It is permanently stored in your account.",
  },
];

const StatusPill = ({ status }) => {
  const map = {
    "in-progress": { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "🔵 In Progress" },
    completed: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "✅ Completed" },
    funding: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "🟡 Seeking Funds" },
  };
  const cfg = map[status] || map["funding"];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const TransparencyCenter = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[32rem] h-[32rem] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <Container>
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <span>🔒</span> Platform-Wide Transparency Center
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Every Rupee.{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Every Stage.
              </span>{" "}
              Publicly Visible.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Vidyadaan is built on radical transparency. Track how every donation flows through a
              ring-fenced escrow, gets verified by an independent NGO inspector, and directly reaches
              government school children — with zero leakage.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/project/proj-1/transparency?role=donor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-600/30 transition-all"
              >
                🔍 View a Live Project
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-full transition-all"
              >
                📖 How It Works
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Platform Stats ─────────────────────────────────────────────────── */}
      <section className="py-14 bg-white border-b border-slate-100">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PLATFORM_STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center text-center p-5 rounded-[20px] bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-black text-base mb-3 shadow-md`}
                >
                  {s.icon}
                </div>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.sub}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── How Money Flows ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              💸 Fund Flow Architecture
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              How Your Donation Reaches the Child
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              A transparent, escrow-backed, NGO-verified 5-step journey. No shortcuts. No leakage.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-rose-200 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10">
              {MONEY_FLOW.map((step) => (
                <div
                  key={step.step}
                  className={`${step.bg} border ${step.border} rounded-[20px] p-5 space-y-3 hover:shadow-lg hover:-translate-y-1 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl ${step.color} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}
                    >
                      {step.step}
                    </div>
                    <span className="text-xl">{step.icon}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Live Verified Projects ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                📋 Live Auditable Projects
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Real Projects. Real Transparency.
              </h2>
              <p className="text-sm text-slate-500">Click any project to view its full audit trail.</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-colors shrink-0"
            >
              View All Projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_PROJECTS.map((proj) => {
              const pct = Math.round((proj.raised / proj.target) * 100);
              return (
                <div
                  key={proj.id}
                  className="bg-white border border-slate-200 rounded-[24px] shadow-md hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-slate-800 to-blue-950 p-5 text-white relative overflow-hidden">
                    <div className="absolute right-3 top-3 text-3xl opacity-20">{proj.badge}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <StatusPill status={proj.status} />
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{proj.udise}</span>
                    </div>
                    <h3 className="font-extrabold text-sm leading-tight">{proj.title}</h3>
                    <p className="text-slate-400 text-[11px] mt-1">
                      📍 {proj.school} · {proj.district}
                    </p>
                    <p className="text-emerald-400 text-[11px] mt-0.5 font-bold">
                      🤝 {proj.ngo}
                    </p>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-500">Funding Progress</span>
                        <span className="text-slate-900">{pct}% Funded</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
                        <span>₹{proj.raised.toLocaleString("en-IN")} raised</span>
                        <span>of ₹{proj.target.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: "❤️", val: proj.donors, label: "Donors" },
                        { icon: "🎒", val: proj.children, label: "Children" },
                        { icon: "✅", val: `${proj.verifiedStages}/${proj.totalStages}`, label: "Stages" },
                      ].map((s) => (
                        <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <span className="text-sm block">{s.icon}</span>
                          <p className="text-xs font-black text-slate-900 mt-0.5">{s.val}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={`/project/${proj.id}/transparency?role=donor`}
                      className="flex items-center justify-center gap-2 w-full h-10 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs rounded-full border border-blue-100 hover:border-blue-600 transition-all"
                    >
                      🔍 View Full Audit Trail →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Compliance & Governance ────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold">
              🛡️ Compliance & Governance
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Built for Trust. Audited by Experts.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {COMPLIANCE.map((c) => (
              <div
                key={c.label}
                className="bg-white border border-slate-200 rounded-[20px] p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <span className="text-2xl block mb-2">{c.icon}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{c.label}</p>
                <p className="text-xs font-bold text-slate-800 mt-1 leading-tight">{c.name}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-slate-100">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                ❓ Common Questions
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Transparency FAQs</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-[18px] overflow-hidden"
                >
                  <button
                    id={`faq-toggle-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  >
                    <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                    <span
                      className={`text-blue-600 text-lg font-black shrink-0 transition-transform duration-200 ${
                        openFaq === i ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-4">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-extrabold">Donate with Complete Confidence</h2>
              <p className="text-blue-200 text-sm mt-1">
                Every rupee is tracked, verified, and auditable by you — forever.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-end shrink-0">
              <Link
                to="/"
                className="px-7 py-3 bg-white text-blue-700 font-extrabold text-sm rounded-full shadow-lg hover:bg-blue-50 transition-colors"
              >
                🏫 Browse Projects
              </Link>
              <Link
                to="/login/donor"
                className="px-7 py-3 bg-blue-800/60 border border-blue-400/40 text-white font-bold text-sm rounded-full hover:bg-blue-800 transition-colors"
              >
                🔑 Donor Login
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default TransparencyCenter;
