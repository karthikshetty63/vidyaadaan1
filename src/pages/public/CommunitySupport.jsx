import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Container from "../../components/layout/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import PaymentFlowModal from "../../components/payment/PaymentFlowModal";
import { SCHOOL_EVENTS_DATA, SPONSOR_CHILD_DATA, COMMUNITY_PILLARS } from "../../data/transparencyData";

const CommunitySupport = () => {
  const [activePillar, setActivePillar] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);

  const openPaymentFor = (item) => {
    setModalTarget(item);
    setPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-28 pb-16 bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <Container>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
              <span>🌱</span> Unified Community Action Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Community <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">Support</span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Transform Government Schools by sponsoring School Events, Child Education Dreams, Science Labs, Libraries, Sports Kits, and Mid-day Meals.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Grid & Modules */}
      <section className="py-16 flex-1">
        <Container>
          {/* Pillar Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 mb-12">
            {COMMUNITY_PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${activePillar === p.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                  }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="text-[11px] font-extrabold leading-tight">{p.title}</span>
              </button>
            ))}
          </div>

          {/* PILLAR 1: SCHOOL EVENTS */}
          {activePillar === "events" && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <SectionTitle
                  pill="School Events"
                  title="Sponsor School Celebrations &"
                  highlight="Fests"
                  subtitle="Support Annual Days, Sports Days, Science Fairs, and Health Camps with itemized sponsorship options."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {SCHOOL_EVENTS_DATA.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white rounded-[28px] border border-slate-200 p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all space-y-6 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          🎟️ {evt.category}
                        </span>
                        <span className="text-xs font-extrabold text-slate-500">🗓️ {evt.date}</span>
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">{evt.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">🏫 {evt.schoolName}</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{evt.description}</p>
                      </div>

                      {/* Required vs Raised Budget */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Budget Raised: ₹{evt.raisedAmount.toLocaleString("en-IN")}</span>
                          <span className="text-emerald-600 font-extrabold">
                            Target: ₹{evt.requiredBudget.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (evt.raisedAmount / evt.requiredBudget) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Itemized Sponsorship List */}
                      <div className="space-y-2.5 pt-2">
                        <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Itemized Event Needs:
                        </p>
                        <div className="space-y-2">
                          {evt.items.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${item.sponsored
                                  ? "bg-slate-50 border-slate-200 text-slate-400"
                                  : "bg-amber-50/50 border-amber-200 text-slate-800"
                                }`}
                            >
                              <div>
                                <span className="font-bold">{item.label}</span>
                                {item.sponsored && (
                                  <span className="text-[10px] text-emerald-600 font-semibold block">
                                    ✓ Sponsored by {item.sponsorName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-black text-slate-900">₹{item.cost.toLocaleString("en-IN")}</span>
                                {!item.sponsored && (
                                  <button
                                    onClick={() =>
                                      openPaymentFor({
                                        title: `${evt.title} - ${item.label}`,
                                        schoolName: evt.schoolName,
                                        amount: item.cost,
                                      })
                                    }
                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg transition-colors"
                                  >
                                    Sponsor Item
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        openPaymentFor({
                          title: `Title Sponsorship for ${evt.title}`,
                          schoolName: evt.schoolName,
                          amount: Math.max(1000, evt.requiredBudget - evt.raisedAmount),
                        })
                      }
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-full shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      🏆 Sponsor Entire Event (₹{(evt.requiredBudget - evt.raisedAmount).toLocaleString("en-IN")})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 2: SPONSOR A CHILD */}
          {activePillar === "sponsor-child" && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <SectionTitle
                  pill="Sponsor a Child"
                  title="Fuel the Dream of a Rural"
                  highlight="Student"
                  subtitle="Provide uniforms, textbooks, bicycles, and digital learning kits for high-potential government school children."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {SPONSOR_CHILD_DATA.map((child) => (
                  <div
                    key={child.id}
                    className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-64 bg-slate-900">
                        <img src={child.photo} alt={child.name} className="w-full h-full object-cover object-top" />
                        <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {child.grade}
                        </div>
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                          {child.priority}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900">{child.name}, {child.age} yrs</h3>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">🏫 {child.school}</p>
                          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                            🌟 <strong>Dream:</strong> {child.dream}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{child.story}</p>

                        {/* Itemized Child Needs */}
                        <div className="space-y-2 pt-2">
                          <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            Specific Student Needs:
                          </p>
                          {child.needs.map((need, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${need.sponsored
                                  ? "bg-slate-50 border-slate-200 text-slate-400"
                                  : "bg-blue-50/60 border-blue-200 text-slate-800"
                                }`}
                            >
                              <span>{need.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">₹{need.cost}</span>
                                {!need.sponsored && (
                                  <button
                                    onClick={() =>
                                      openPaymentFor({
                                        title: `Sponsor ${need.label} for ${child.name}`,
                                        schoolName: child.school,
                                        amount: need.cost,
                                      })
                                    }
                                    className="px-2.5 py-1 bg-blue-600 text-white font-bold text-[10px] rounded-lg"
                                  >
                                    Sponsor
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        onClick={() =>
                          openPaymentFor({
                            title: `Sponsor Full Academic Year for ${child.name}`,
                            schoolName: child.school,
                            amount: child.annualCost,
                          })
                        }
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/20 transition-all"
                      >
                        🎓 Sponsor Academic Year (₹{child.annualCost.toLocaleString("en-IN")})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER PILLARS DEFAULT VIEW */}
          {activePillar !== "events" && activePillar !== "sponsor-child" && (
            <div className="bg-white rounded-[28px] p-12 border border-slate-200 text-center space-y-6 max-w-2xl mx-auto shadow-xl">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto">
                {COMMUNITY_PILLARS.find((p) => p.id === activePillar)?.icon}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                  {COMMUNITY_PILLARS.find((p) => p.id === activePillar)?.title} Drive
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  {COMMUNITY_PILLARS.find((p) => p.id === activePillar)?.desc}. You can contribute directly to our verified ring-fenced escrow fund for this initiative.
                </p>
              </div>

              <button
                onClick={() =>
                  openPaymentFor({
                    title: `Community Contribution - ${COMMUNITY_PILLARS.find((p) => p.id === activePillar)?.title}`,
                    schoolName: "Verified Government School Network",
                    amount: 5000,
                  })
                }
                className="h-13 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-emerald-600/25 transition-all"
              >
                💚 Contribute to {COMMUNITY_PILLARS.find((p) => p.id === activePillar)?.title} Drive
              </button>
            </div>
          )}
        </Container>
      </section>

      <Footer />

      {/* Payment Flow Modal */}
      <PaymentFlowModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        targetItem={modalTarget}
      />
    </div>
  );
};

export default CommunitySupport;
