import React, { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import StatsWidget from "../../../components/dashboard/StatsWidget";
import DonationTable from "../../../components/dashboard/DonationTable";
import TimelineWidget from "../../../components/dashboard/TimelineWidget";
import EventCard from "../../../components/events/EventCard";
import SponsorEventModal from "../../../components/events/SponsorEventModal";
import { initialEvents, eventCategories } from "../../../data/eventsData";

/* ─── MOCK DATA ─────────────────────────────────────────── */
const stats = [
  { icon: "💙", label: "Total Donated", value: "₹45,000", change: 15, color: "amber" },
  { icon: "🎉", label: "Events Sponsored", value: "2", change: 100, color: "emerald" },
  { icon: "👦", label: "Children Helped", value: "182", change: 24, color: "blue" },
  { icon: "📜", label: "Tax Savings (80G)", value: "₹22,500", change: 15, color: "purple" },
];

const myDonations = [
  { project: "Annual Sports Meet (Medals & Food)", school: "Honnali Govt. Primary School", amount: 16500, date: "27 Jul 2026", status: "Completed", cert: "80G Certificate" },
  { project: "Science Fair (Experiment Kits)", school: "Govt. HS Shikaripura", amount: 9000, date: "28 Feb 2026", status: "Completed", cert: "80G Certificate" },
  { project: "Smart Classroom Setup", school: "Honnali Govt. Primary School", amount: 15000, date: "22 Jul 2026", status: "Completed", cert: "80G Certificate" },
  { project: "Drinking Water Purifier", school: "GTHS Chitradurga", amount: 4500, date: "02 Feb 2026", status: "Completed", cert: "80G Certificate" },
];

const impactGallery = [
  { before: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop", label: "Science Fair Project Award", school: "Shikaripura HS", date: "Feb 2026" },
  { before: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=400&auto=format&fit=crop", label: "Sports Day Medals Distribution", school: "Honnali Primary", date: "Jul 2026" },
];

const timeline = [
  { icon: "🎉", title: "You sponsored Sports Day Medals!", desc: "₹4,500 contribution to Honnali Primary School Sports Day", time: "2h ago", color: "bg-amber-100 text-amber-600" },
  { icon: "📜", title: "80G Tax Certificate Generated", desc: "Download your certificate for Sports Day donation #VD-EVT-9921", time: "2h ago", color: "bg-emerald-100 text-emerald-600" },
  { icon: "📸", title: "New Progress Photo Uploaded", desc: "Honnali Primary uploaded Sports Day prep photos", time: "1d ago", color: "bg-blue-100 text-blue-600" },
  { icon: "💙", title: "Science Fair Report Completed", desc: "Thank you report & 320 student photos sent to your email", time: "Feb 2026", color: "bg-purple-100 text-purple-600" },
];

const quickActions = [
  { icon: "🎉", label: "Sponsor School Event", bg: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400" },
  { icon: "📜", label: "Download 80G Certificates", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400" },
  { icon: "💬", label: "Send Message to School", bg: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400" },
  { icon: "📣", label: "Share Event Impact", bg: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400" },
];

/* ─── DONOR DASHBOARD ─────────────────────────────────────── */
const DonorDashboard = () => {
  const [eventsList, setEventsList] = useState(initialEvents);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEventForSponsor, setSelectedEventForSponsor] = useState(null);

  const handleSponsorSuccess = ({ eventId, donorName, totalAmt, sponsoredItemIds, sponsoredItemLabels }) => {
    setEventsList((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updatedItems = e.requestedItems.map((item) =>
            sponsoredItemIds.includes(item.id)
              ? { ...item, sponsored: true, sponsorName: donorName }
              : item
          );
          const newRaised = e.raisedAmount + totalAmt;
          return {
            ...e,
            raisedAmount: newRaised,
            requestedItems: updatedItems,
            status: newRaised >= e.requiredBudget ? "Fully Sponsored" : "Active",
          };
        }
        return e;
      })
    );
  };

  const filteredEvents = eventsList.filter(
    (e) => selectedCategory === "All" || e.category === selectedCategory
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="donor" userName="Ramesh Kumar" userSub="Individual Donor · Bengaluru" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar role="donor" title="Donor Dashboard" subtitle="Welcome back, Ramesh!" notifications={[1]} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">

          {/* Hero Banner */}
          <section id="overview" className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 text-white shadow-2xl shadow-amber-500/20">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
                {[...Array(20)].map((_, i) => <circle key={i} cx={i * 35} cy={(i % 3) * 60 + 20} r="40" fill="white" />)}
              </svg>
            </div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <span>🏆</span> Champion Supporter Level 3
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mb-1">Welcome back, Ramesh Kumar!</h1>
                <p className="text-amber-100 text-sm">💙 You've helped 182 children get better education facilities & event celebrations.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById("events");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="h-12 px-6 bg-white text-amber-600 font-extrabold text-xs rounded-full shadow-lg hover:bg-amber-50 transition-all flex items-center gap-2"
                >
                  <span>🎉</span> Sponsor a School Event
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <StatsWidget stats={stats} />

          {/* 🎉 SUPPORT SCHOOL EVENTS (DONOR SECTION) */}
          <section id="events" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-1">
                  <span>🎉</span> School Celebrations & Program Sponsorship
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Support School Events</h2>
                <p className="text-xs text-slate-500">Sponsor food, medals, trophies, sports kits, or sound systems for government school children.</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                {["All", "Sports Day", "Science Fair", "Children's Day"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userRole="donor"
                  onSponsorItems={(evt) => setSelectedEventForSponsor(evt)}
                  onDonateAmount={(evt) => setSelectedEventForSponsor(evt)}
                  onViewDetails={(evt) => setSelectedEventForSponsor(evt)}
                />
              ))}
            </div>
          </section>

          {/* Timeline & Impact */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Impact Gallery */}
            <section id="impact" className="xl:col-span-2 bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 scroll-mt-24">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Before & After of Events & Projects You Supported</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real transformation pictures from schools you donated to</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  100% Verified Impact
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {impactGallery.map((g) => (
                  <div key={g.label}>
                    <div className="grid grid-cols-2 gap-3 rounded-[16px] overflow-hidden mb-2">
                      <div className="relative">
                        <img src={g.before} alt="Before" className="w-full h-32 object-cover rounded-xl" />
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">BEFORE</span>
                      </div>
                      <div className="relative">
                        <img src={g.after} alt="After" className="w-full h-32 object-cover rounded-xl" />
                        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">AFTER</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{g.label}</span>
                        <p className="text-[10px] text-slate-400">🏫 {g.school}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{g.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <TimelineWidget events={timeline} title="Your Impact Activity" />
          </div>

          {/* Donation History Table */}
          <section id="donations" className="scroll-mt-24">
            <DonationTable rows={myDonations} title="My Event & Project Donation History" />
          </section>

          {/* Quick Actions */}
          <section id="settings" className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 scroll-mt-24">
            {quickActions.map(({ icon, label, bg }) => (
              <button
                key={label}
                onClick={() => {
                  if (label.includes("Sponsor")) {
                    const el = document.getElementById("events");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`flex flex-col items-center gap-2 p-5 rounded-[20px] border-2 ${bg} shadow-sm transition-all`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-bold text-center leading-tight">{label}</span>
              </button>
            ))}
          </section>

        </main>
      </div>

      {/* Sponsor Modal */}
      <SponsorEventModal
        isOpen={!!selectedEventForSponsor}
        onClose={() => setSelectedEventForSponsor(null)}
        event={selectedEventForSponsor}
        onSponsorSuccess={handleSponsorSuccess}
      />
    </div>
  );
};

export default DonorDashboard;
