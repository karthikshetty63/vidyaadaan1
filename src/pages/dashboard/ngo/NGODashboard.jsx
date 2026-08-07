import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import StatsWidget from "../../../components/dashboard/StatsWidget";
import DonationTable from "../../../components/dashboard/DonationTable";
import TimelineWidget from "../../../components/dashboard/TimelineWidget";
import EventCard from "../../../components/events/EventCard";
import SponsorEventModal from "../../../components/events/SponsorEventModal";
import NGOProjectSupportModal from "../../../components/dashboard/NGOProjectSupportModal";
import { initialEvents } from "../../../data/eventsData";

/* ─── MOCK DATA ─────────────────────────────────────────── */
const stats = [
  { icon: "🏫", label: "Schools Supported", value: "14", change: 4, color: "blue" },
  { icon: "🎉", label: "School Events Partnered", value: "5", change: 2, color: "amber" },
  { icon: "👥", label: "Volunteers Active", value: "67", change: 11, color: "purple" },
  { icon: "💰", label: "Funds & Items Managed", value: "₹8.4L", change: 18, color: "emerald" },
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

const queue = [
  { school: "Govt. HS Shikaripura", district: "Shivamogga", need: "Library Books", date: "25 Jul", urgency: "Urgent", students: 320 },
  { school: "Govt. Primary Honnali", district: "Davangere", need: "Water Purifier", date: "23 Jul", urgency: "High", students: 438 },
  { school: "GTHS Chitradurga", district: "Chitradurga", need: "Smart Board", date: "20 Jul", urgency: "Medium", students: 511 },
  { school: "GPS Tumkur", district: "Tumkur", need: "Toilet Renovation", date: "18 Jul", urgency: "Urgent", students: 290 },
];

const urgencyStyle = {
  Urgent: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
};

const volunteers = [
  { name: "Ananya Sharma", role: "Field Coordinator", school: "Honnali Primary (Sports Day)", status: "Active" },
  { name: "Rajiv Nair", role: "Event Coordinator", school: "Shikaripura (Science Fair)", status: "Active" },
  { name: "Meena Pillai", role: "Health Worker", school: "GPS Tumkur", status: "On Leave" },
  { name: "Suresh Kumar", role: "IT & Sound Tech", school: "Govt. HS Shikaripura", status: "Active" },
  { name: "Divya Reddy", role: "Photography", school: "Multiple Events", status: "Active" },
];

const fundingRows = [
  { name: "HDFC Bank CSR", sub: "Corporate", amount: 150000, date: "20 Jul 2026", purpose: "Sports Kits & Science Kits", status: "Completed" },
  { name: "Infosys Foundation", sub: "CSR", amount: 200000, date: "15 Jul 2026", purpose: "Digital Labs & Sound", status: "Processing" },
  { name: "Anonymous Donor", sub: "Individual", amount: 25000, date: "10 Jul 2026", purpose: "Midday Meal Food", status: "Completed" },
  { name: "Rotary Club", sub: "Community", amount: 40000, date: "5 Jul 2026", purpose: "Water & Medals", status: "Verified" },
];

const timeline = [
  { icon: "🎉", title: "Sports Day event request received", desc: "Honnali Primary requested support for 8 item packages", time: "1h ago", color: "bg-amber-100 text-amber-600" },
  { icon: "👥", title: "6 Volunteers assigned to Sports Day", desc: "Field Coordinators assigned to Honnali school ground", time: "2h ago", color: "bg-purple-100 text-purple-600" },
  { icon: "✅", title: "Science Fair completed & verified", desc: "Field visit report & 320 student photos uploaded", time: "3h ago", color: "bg-emerald-100 text-emerald-600" },
  { icon: "💰", title: "₹1,50,000 received from HDFC CSR", desc: "Funds allocated to Sports Kits & Science Kits", time: "Yesterday", color: "bg-blue-100 text-blue-600" },
];

const quickActions = [
  { icon: "🎉", label: "Review Event Requests", bg: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400" },
  { icon: "🏫", label: "Review School Request", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400" },
  { icon: "👥", label: "Assign Volunteers to Event", bg: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400" },
  { icon: "📊", label: "Generate Impact Report", bg: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400" },
];

/* ─── NGO DASHBOARD ─────────────────────────────────────── */
const NGODashboard = () => {
  const [eventsList, setEventsList] = useState(initialEvents);
  const [schoolNeeds, setSchoolNeeds] = useState(directSchoolNeedsList);
  const [needCategory, setNeedCategory] = useState("All");
  const [selectedTab, setSelectedTab] = useState("Pending");
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
            volunteersAssigned: e.volunteersAssigned + 2,
            status: newRaised >= e.requiredBudget ? "Fully Sponsored" : "Active",
          };
        }
        return e;
      })
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="ngo" userName="Shiksha Seva Foundation" userSub="Karnataka · Verified NGO" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar role="ngo" title="NGO Dashboard" subtitle="Shiksha Seva Foundation" notifications={[1, 2]} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">

          {/* Hero Banner */}
          <section id="overview" className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 p-8 text-white shadow-2xl shadow-emerald-700/20">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
                {[...Array(20)].map((_, i) => <circle key={i} cx={i * 35} cy={(i % 3) * 60 + 20} r="40" fill="white" />)}
              </svg>
            </div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  Verified NGO · 80G Certified · FCRA Approved
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mb-1">Shiksha Seva Foundation</h1>
                <p className="text-emerald-100 text-sm">🌱 Empowering Rural Education · Karnataka, Tamil Nadu</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-4 text-center">
                  <div className="text-2xl font-black">94</div>
                  <div className="text-xs font-bold text-emerald-100">Impact Score</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-4 text-center">
                  <div className="text-2xl font-black">4.8★</div>
                  <div className="text-xs font-bold text-emerald-100">Trust Rating</div>
                </div>
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
              {schoolNeeds
                .filter((n) => needCategory === "All" || n.category === needCategory)
                .map((need) => (
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
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>🤝</span> NGO Project Support
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>




          {/* 🎉 SCHOOL EVENT REQUESTS (NGO SECTION) */}
          <section id="events" className="scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-1">
                  <span>🎉</span> NGO Support Portal
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">School Event Requests</h2>
                <p className="text-xs text-slate-500">Review school events, sponsor items (food, medals, sound), assign volunteers, and track progress.</p>
              </div>
              <span className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow shrink-0">
                {eventsList.filter((e) => e.status !== "Completed").length} Events Need NGO Partner
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {eventsList.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userRole="ngo"
                  onSponsorItems={(evt) => setSelectedEventForSponsor(evt)}
                  onViewDetails={(evt) => setSelectedEventForSponsor(evt)}
                />
              ))}
            </div>
          </section>

          {/* Priority Queue + Timeline */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* School Queue */}
            <section id="schools" className="xl:col-span-2 bg-white rounded-[20px] border border-slate-100 shadow-sm scroll-mt-24">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">School Priority Queue</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Schools awaiting your review and support</p>
                </div>
                <div className="flex gap-2">
                  {["Pending", "Approved", "All"].map(tab => (
                    <button key={tab} onClick={() => setSelectedTab(tab)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedTab === tab ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {queue.map((item) => (
                  <div key={item.school} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">🏫</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-900 truncate">{item.school}</span>
                        <span className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${urgencyStyle[item.urgency]}`}>{item.urgency}</span>
                      </div>
                      <p className="text-xs text-slate-400">📍 {item.district} · {item.students} students · Need: {item.need}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                      <div className="flex gap-1">
                        <button className="h-7 px-3 bg-emerald-600 text-white text-[10px] font-bold rounded-full hover:bg-emerald-700 transition-colors">Accept</button>
                        <button className="h-7 px-3 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full hover:bg-slate-200 transition-colors">View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <TimelineWidget events={timeline} title="NGO Activity" />
          </div>

          {/* Volunteer Management */}
          <section id="volunteers" className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden scroll-mt-24">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Volunteer Management & Event Assignment</h3>
              <button className="h-9 px-5 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">+ Add Volunteer</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Volunteer", "Role", "Assigned Event / School", "Status", "Action"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {volunteers.map((v) => (
                    <tr key={v.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">{v.name.charAt(0)}</div>
                          <span className="text-sm font-bold text-slate-900">{v.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">{v.role}</td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">{v.school}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${v.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{v.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-xs font-bold text-blue-600 hover:underline">Assign →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Funding Overview */}
          <section id="funding" className="scroll-mt-24">
            <DonationTable rows={fundingRows} title="Event & Project Funding Overview" />
          </section>

          {/* Quick Actions / Reports / Settings */}
          <section id="settings" className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 scroll-mt-24">
            {quickActions.map(({ icon, label, bg }) => (
              <button key={label} className={`flex flex-col items-center gap-2 p-5 rounded-[20px] border-2 ${bg} shadow-sm transition-all`}>
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-bold text-center leading-tight">{label}</span>
              </button>
            ))}
          </section>

        </main>
      </div>

      {/* NGO Project Support Modal */}
      <NGOProjectSupportModal
        isOpen={!!selectedNeedForDonate}
        onClose={() => setSelectedNeedForDonate(null)}
        need={selectedNeedForDonate}
        onSupportSuccess={handleNeedDonateSuccess}
      />

      {/* Sponsor / Assign Modal */}
      <SponsorEventModal
        isOpen={!!selectedEventForSponsor}
        onClose={() => setSelectedEventForSponsor(null)}
        event={selectedEventForSponsor}
        onSponsorSuccess={handleSponsorSuccess}
      />
    </div>
  );
};

export default NGODashboard;
