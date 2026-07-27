import React, { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import StatsWidget from "../../../components/dashboard/StatsWidget";
import DonationTable from "../../../components/dashboard/DonationTable";
import TimelineWidget from "../../../components/dashboard/TimelineWidget";
import EventCard from "../../../components/events/EventCard";
import SponsorEventModal from "../../../components/events/SponsorEventModal";
import SponsorNeedModal from "../../../components/dashboard/SponsorNeedModal";
import { initialEvents } from "../../../data/eventsData";

/* ─── MOCK DATA ─────────────────────────────────────────── */
const stats = [
  { icon: "💙", label: "Total Donated", value: "₹45,000", change: 15, color: "amber" },
  { icon: "📋", label: "School Needs Funded", value: "4", change: 33, color: "blue" },
  { icon: "🎉", label: "Events Sponsored", value: "2", change: 100, color: "emerald" },
  { icon: "📜", label: "Tax Savings (80G)", value: "₹22,500", change: 15, color: "purple" },
];

const directSchoolNeedsList = [
  {
    id: "need-1",
    label: "Smart Classroom & Interactive Board",
    category: "Classroom",
    schoolName: "Honnali Govt. Primary School",
    district: "Davangere, Karnataka",
    amount: "₹1,20,000",
    progress: 35,
    priority: "Urgent",
    icon: "💻",
    img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "need-2",
    label: "Girls Toilet Sanitation & Running Water",
    category: "Water & Sanitation",
    schoolName: "Govt. High School, Shikaripura",
    district: "Shivamogga, Karnataka",
    amount: "₹45,000",
    progress: 72,
    priority: "Urgent",
    icon: "🚻",
    img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "need-3",
    label: "Library Books (400+ English & Kannada)",
    category: "Library",
    schoolName: "GPS Tumkur Model School",
    district: "Tumkur, Karnataka",
    amount: "₹22,000",
    progress: 10,
    priority: "High",
    icon: "📚",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "need-4",
    label: "RO Drinking Water Purifier Unit",
    category: "Water & Sanitation",
    schoolName: "GTHS Chitradurga School",
    district: "Chitradurga, Karnataka",
    amount: "₹18,000",
    progress: 0,
    priority: "Urgent",
    icon: "💧",
    img: "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "need-5",
    label: "5kW Solar Roof Panels & Battery",
    category: "Infrastructure",
    schoolName: "Zilla Parishad School, Mandya",
    district: "Mandya, Karnataka",
    amount: "₹2,80,000",
    progress: 20,
    priority: "Medium",
    icon: "☀️",
    img: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "need-6",
    label: "Computer Lab Setup (10 Refurbished PCs)",
    category: "Digital Labs",
    schoolName: "Govt. HS Hosadurga",
    district: "Chitradurga, Karnataka",
    amount: "₹2,50,000",
    progress: 60,
    priority: "High",
    icon: "🖥️",
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop",
  },
];

const priorityBadgeCls = {
  Urgent: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
};

const myDonations = [
  { project: "Smart Classroom & Interactive Board", school: "Honnali Govt. Primary School", amount: 15000, date: "27 Jul 2026", status: "Completed", cert: "80G Certificate" },
  { project: "Annual Sports Meet (Medals & Food)", school: "Honnali Govt. Primary School", amount: 16500, date: "22 Jul 2026", status: "Completed", cert: "80G Certificate" },
  { project: "Science Fair (Experiment Kits)", school: "Govt. HS Shikaripura", amount: 9000, date: "28 Feb 2026", status: "Completed", cert: "80G Certificate" },
  { project: "Drinking Water Purifier Unit", school: "GTHS Chitradurga", amount: 4500, date: "02 Feb 2026", status: "Completed", cert: "80G Certificate" },
];

const impactGallery = [
  { before: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop", label: "Smart Classroom Installed", school: "Honnali Primary", date: "Jul 2026" },
  { before: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=400&auto=format&fit=crop", label: "Library Books Delivered", school: "GPS Tumkur", date: "May 2026" },
];

const timeline = [
  { icon: "💙", title: "Donated ₹5,000 to Smart Classroom", desc: "Fulfilling urgent infrastructure need at Honnali Primary", time: "10m ago", color: "bg-blue-100 text-blue-600" },
  { icon: "🎉", title: "You sponsored Sports Day Medals!", desc: "₹4,500 contribution to Honnali Primary School Sports Day", time: "2h ago", color: "bg-amber-100 text-amber-600" },
  { icon: "📜", title: "80G Tax Certificate Generated", desc: "Download your certificate for donation #VD-EVT-9921", time: "2h ago", color: "bg-emerald-100 text-emerald-600" },
  { icon: "📸", title: "New Progress Photo Uploaded", desc: "Honnali Primary uploaded classroom installation photos", time: "1d ago", color: "bg-purple-100 text-purple-600" },
];

const quickActions = [
  { icon: "📋", label: "Donate to School Need", bg: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400" },
  { icon: "🎉", label: "Sponsor School Event", bg: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400" },
  { icon: "📜", label: "Download 80G Certificates", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400" },
  { icon: "💬", label: "Send Message to School", bg: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400" },
];

/* ─── DONOR DASHBOARD ─────────────────────────────────────── */
const DonorDashboard = () => {
  const [eventsList, setEventsList] = useState(initialEvents);
  const [schoolNeeds, setSchoolNeeds] = useState(directSchoolNeedsList);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [needCategory, setNeedCategory] = useState("All");

  const [selectedEventForSponsor, setSelectedEventForSponsor] = useState(null);
  const [selectedNeedForDonate, setSelectedNeedForDonate] = useState(null);

  const handleNeedDonateSuccess = ({ needLabel, schoolName, amount }) => {
    setSchoolNeeds((prev) =>
      prev.map((n) => {
        if (n.label === needLabel) {
          const targetNum = typeof n.amount === "number" ? n.amount : parseInt(n.amount.replace(/[^0-9]/g, "")) || 45000;
          const currentRaised = Math.round((targetNum * n.progress) / 100);
          const newRaised = currentRaised + amount;
          const newPct = Math.min(100, Math.round((newRaised / targetNum) * 100));
          return { ...n, progress: newPct };
        }
        return n;
      })
    );
  };

  const handleEventSponsorSuccess = ({ eventId, donorName, totalAmt, sponsoredItemIds }) => {
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

  const filteredNeeds = schoolNeeds.filter(
    (n) => needCategory === "All" || n.category === needCategory
  );

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
                <p className="text-amber-100 text-sm">💙 You can donate directly to Government School Needs & Events.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById("needs");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="h-12 px-6 bg-white text-slate-900 font-extrabold text-xs rounded-full shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <span>📋</span> Donate to School Needs
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <StatsWidget stats={stats} />

          {/* 📋 DIRECT SCHOOL NEEDS FUNDING SECTION */}
          <section id="needs" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-1">
                  <span>📋</span> Infrastructure & Facilities
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Direct School Infrastructure Needs</h2>
                <p className="text-xs text-slate-500">Fund classrooms, toilets, drinking water, library books, computers, and solar panels directly.</p>
              </div>

              {/* Need Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                {["All", "Classroom", "Water & Sanitation", "Library", "Digital Labs"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNeedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                      needCategory === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Need Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNeeds.map((need) => (
                <div
                  key={need.id}
                  className="bg-white rounded-[24px] border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={need.img}
                      alt={need.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase">
                        {need.icon} {need.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${priorityBadgeCls[need.priority]}`}>
                        {need.priority}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <p className="text-xs font-extrabold text-blue-200">🏫 {need.schoolName}</p>
                      <p className="text-[10px] text-slate-300">📍 {need.district}</p>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base mb-3 group-hover:text-blue-600 transition-colors">
                        {need.label}
                      </h3>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Target: {need.amount}</span>
                        <span className="text-blue-600">{need.progress}% Funded</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${need.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedNeedForDonate(need)}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>💙</span> Donate to School Need
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 🎉 SUPPORT SCHOOL EVENTS (DONOR SECTION) */}
          <section id="events" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-1">
                  <span>🎉</span> Celebrations & Program Sponsorship
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Support School Events</h2>
                <p className="text-xs text-slate-500">Sponsor food, medals, trophies, sports kits, or sound systems for government school children.</p>
              </div>

              {/* Event Category Filter Pills */}
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

          {/* Impact & Timeline */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Impact Gallery */}
            <section id="impact" className="xl:col-span-2 bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 scroll-mt-24">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Before & After of Needs & Events You Supported</h3>
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
            <DonationTable rows={myDonations} title="My Needs & Event Donation History" />
          </section>

          {/* Quick Actions */}
          <section id="settings" className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 scroll-mt-24">
            {quickActions.map(({ icon, label, bg }) => (
              <button
                key={label}
                onClick={() => {
                  if (label.includes("Need")) {
                    const el = document.getElementById("needs");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else if (label.includes("Event")) {
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

      {/* Need Donation Modal */}
      <SponsorNeedModal
        isOpen={!!selectedNeedForDonate}
        onClose={() => setSelectedNeedForDonate(null)}
        need={selectedNeedForDonate}
        onDonateSuccess={handleNeedDonateSuccess}
      />

      {/* Event Sponsor Modal */}
      <SponsorEventModal
        isOpen={!!selectedEventForSponsor}
        onClose={() => setSelectedEventForSponsor(null)}
        event={selectedEventForSponsor}
        onSponsorSuccess={handleEventSponsorSuccess}
      />
    </div>
  );
};

export default DonorDashboard;
