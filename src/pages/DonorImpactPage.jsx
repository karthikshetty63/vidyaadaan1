import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Container from "../components/layout/Container";
import SectionTitle from "../components/ui/SectionTitle";
import { DONOR_JOURNEY_STAGES, PAYMENT_TRANSPARENCY_HISTORY } from "../data/transparencyData";

const DonorImpactPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-28 pb-16 bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <Container>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <span>💖</span> Personalized Donor Transparency Portal
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              My <span className="bg-gradient-to-r from-blue-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">Impact Dashboard</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every rupee you contribute creates measurable real-world change. Track your active school projects, photo updates, 80G tax receipts, and student thank-you notes.
            </p>
          </div>
        </Container>
      </section>

      {/* Impact Stats Grid */}
      <section className="py-12 -mt-8">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Donations", val: "₹ 47,500", icon: "💰", color: "blue" },
              { label: "Schools Supported", val: "3 Schools", icon: "🏫", color: "emerald" },
              { label: "Projects Completed", val: "2 Completed", icon: "🏁", color: "purple" },
              { label: "Children Benefited", val: "480 Kids", icon: "🎒", color: "amber" },
              { label: "NGOs Supported", val: "2 NGOs", icon: "🤝", color: "teal" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg space-y-2">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.val}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Main Impact Sections */}
      <section className="py-12 flex-1">
        <Container>
          <div className="space-y-12">

            {/* Donation Timeline Tracker */}
            <div className="space-y-6">
              <SectionTitle
                pill="Active Journey"
                title="Your Active Project"
                highlight="Donation Journey"
                subtitle="Honnali Govt. Primary School • Digital Classroom Upgrade"
              />

              <div className="bg-white rounded-[28px] border border-slate-200 p-6 sm:p-8 shadow-xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {DONOR_JOURNEY_STAGES.slice(0, 6).map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="p-3.5 rounded-2xl border border-emerald-500 bg-emerald-50/60 text-center space-y-1"
                    >
                      <span className="text-lg block">{stage.icon}</span>
                      <span className="text-[11px] font-extrabold text-slate-900 block">{stage.label}</span>
                      <span className="text-[9px] font-bold text-emerald-700 block">✓ Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thank You Messages & Letters */}
            <div className="space-y-6">
              <SectionTitle
                pill="Student Messages"
                title="Letters & Thank You"
                highlight="Notes"
                subtitle="Messages directly from teachers and students whose classrooms were transformed."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    author: "Principal Suresh Kumar",
                    school: "Honnali Govt. Primary School",
                    message: "Dear Rameshji, your contribution enabled 240 children to access computer education for the first time. We uploaded the completed photos on the transparency center!",
                    date: "05 Apr 2026",
                    icon: "✉️",
                  },
                  {
                    author: "Kavya S. (Student, 5th Grade)",
                    school: "Honnali Govt. Primary School",
                    message: "Thank you for the new Smart TV in our class! I love watching animated science videos with my classmates.",
                    date: "02 Apr 2026",
                    icon: "🎨",
                  },
                ].map((letter, idx) => (
                  <div key={idx} className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{letter.icon}</span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{letter.author}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{letter.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed font-medium">"{letter.message}"</p>
                    <span className="text-[10px] text-blue-600 font-bold block">🏫 {letter.school}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipts & 80G Certificates */}
            <div className="space-y-6">
              <SectionTitle
                pill="Tax & Audit Logs"
                title="80G Certificates & Tax"
                highlight="Receipts"
                subtitle="Download official tax exemption receipts instantly for all your donations."
              />

              <div className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-xl p-6">
                <div className="space-y-3">
                  {PAYMENT_TRANSPARENCY_HISTORY.slice(0, 2).map((txn) => (
                    <div key={txn.txnId} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">{txn.purpose}</p>
                        <p className="text-[11px] text-slate-500 font-medium">🏫 {txn.schoolName} • {txn.date}</p>
                        <p className="text-[10px] font-mono text-emerald-600 font-bold mt-1">Receipt No: {txn.receiptNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-900">₹{txn.amount.toLocaleString("en-IN")}</span>
                        <button
                          onClick={() => alert(`Downloading 80G Receipt: ${txn.receiptNumber}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md shadow-blue-600/20"
                        >
                          📜 Download 80G PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default DonorImpactPage;
