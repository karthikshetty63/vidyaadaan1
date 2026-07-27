import React, { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import StatsWidget from "../../../components/dashboard/StatsWidget";
import DonationTable from "../../../components/dashboard/DonationTable";
import TimelineWidget from "../../../components/dashboard/TimelineWidget";
import EventCard from "../../../components/events/EventCard";
import CreateEventModal from "../../../components/events/CreateEventModal";
import SponsorEventModal from "../../../components/events/SponsorEventModal";
import PostEventUploadModal from "../../../components/events/PostEventUploadModal";
import { initialEvents } from "../../../data/eventsData";

/* ─── MOCK DATA ─────────────────────────────────────────── */
const stats = [
  { icon: "💰", label: "Total Raised", value: "₹4,82,000", change: 12, color: "emerald" },
  { icon: "🎉", label: "School Events", value: "3", change: 1, color: "amber" },
  { icon: "👧", label: "Students Benefited", value: "438", change: 8, color: "purple" },
  { icon: "🤝", label: "NGO Partners", value: "3", change: 0, color: "blue" },
];

const needs = [
  { label: "Smart Classroom Setup", priority: "Urgent", icon: "💻", progress: 35, amount: "₹1,20,000" },
  { label: "Girls Toilet Renovation", priority: "High", icon: "🚻", progress: 72, amount: "₹45,000" },
  { label: "Library Books (400+)", priority: "Medium", icon: "📚", progress: 10, amount: "₹22,000" },
  { label: "Drinking Water Purifier", priority: "Urgent", icon: "💧", progress: 0, amount: "₹18,000" },
  { label: "Solar Panels", priority: "Low", icon: "☀️", progress: 0, amount: "₹2,80,000" },
];

const priorityStyles = {
  Urgent: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

const gallery = [
  { before: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop", label: "Classroom Renovation", date: "Jun 2025" },
  { before: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=400&auto=format&fit=crop", label: "Library Setup", date: "Apr 2025" },
];

const donations = [
  { name: "Ramesh Kumar", sub: "Individual Donor", amount: 5000, date: "27 Jul 2026", purpose: "Sports Day Medals", status: "Completed" },
  { name: "Shiksha Foundation", sub: "NGO", amount: 25000, date: "25 Jul 2026", purpose: "Sports Kits", status: "Processing" },
  { name: "Priya Mehta", sub: "CSR Donation", amount: 10000, date: "22 Jul 2026", purpose: "Water Purifier", status: "Pending" },
  { name: "Tech Corp Ltd", sub: "Corporate CSR", amount: 50000, date: "18 Jul 2026", purpose: "Solar Panels", status: "Verified" },
];

const timeline = [
  { icon: "🎉", title: "New Event Created — Sports Day 2026", desc: "Requested support for 8 item packages", time: "10m ago", color: "bg-amber-100 text-amber-600" },
  { icon: "📩", title: "New donation of ₹5,000 received", desc: "From Ramesh Kumar for Sports Day Medals", time: "2h ago", color: "bg-emerald-100 text-emerald-600" },
  { icon: "🔍", title: "NGO verification completed", desc: "Shiksha Seva Foundation assigned 6 volunteers", time: "Yesterday", color: "bg-blue-100 text-blue-600" },
  { icon: "📸", title: "Science Fair report submitted", desc: "Completion report approved for 320 students", time: "2d ago", color: "bg-purple-100 text-purple-600" },
];

const quickActions = [
  { icon: "🎉", label: "Create School Event", bg: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400" },
  { icon: "📋", label: "Submit Infrastructure Need", bg: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400" },
  { icon: "📸", label: "Upload Gallery Photo", bg: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400" },
  { icon: "📊", label: "Download Impact Report", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400" },
];

/* ─── SCHOOL DASHBOARD ─────────────────────────────────── */
const SchoolDashboard = () => {
  const [eventsList, setEventsList] = useState(initialEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEventForUpload, setSelectedEventForUpload] = useState(null);
  const [selectedEventForSponsor, setSelectedEventForSponsor] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  const handleCreateEvent = (newEvent) => {
    setEventsList([newEvent, ...eventsList]);
  };

  const handlePostReport = ({ eventId, thankYouMessage, studentsBenefited, photos }) => {
    setEventsList((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status: "Completed",
              impactReport: { completionDate: "Just now", studentsBenefited, thankYouMessage, photos },
            }
          : e
      )
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="school" userName="Honnali Primary" userSub="Davangere District, Karnataka" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar role="school" title="Dashboard" subtitle="Honnali Govt. Primary School" notifications={[1]} />

        {/* Page Scrollable Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">

          {/* Hero Banner / Profile */}
          <section id="overview" className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-8 text-white shadow-2xl shadow-blue-700/20">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
                {[...Array(20)].map((_, i) => <circle key={i} cx={i * 35} cy={(i % 3) * 60 + 20} r="40" fill="white" />)}
              </svg>
            </div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Verified School — UDISE: 29140112801
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mb-1">Honnali Govt. Primary School</h1>
                <p className="text-blue-100 text-sm">📍 Davangere District, Karnataka — 438 Students</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
                  <div className="text-2xl font-black">78</div>
                  <div className="text-[10px] font-bold text-blue-100">Development Score</div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-12 px-6 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-full shadow-lg transition-all flex items-center gap-2"
                >
                  <span>🎉</span> Create School Event
                </button>
              </div>
            </div>
          </section>

          {/* Stats Row */}
          <StatsWidget stats={stats} />

          {/* 🎉 SCHOOL EVENTS & PROGRAM SPONSORSHIP SECTION */}
          <section id="events" className="scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-1">
                  <span>🎉</span> Events & Celebrations
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">School Events & Support Requests</h2>
                <p className="text-xs text-slate-500">Request food, snacks, sports kits, medals, and sound systems from NGOs and Donors.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 shrink-0"
              >
                <span>+</span> Request Event Support
              </button>
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {eventsList.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  userRole="school"
                  onPostEventUpload={(evt) => setSelectedEventForUpload(evt)}
                  onViewDetails={(evt) => setSelectedEventDetails(evt)}
                />
              ))}
            </div>
          </section>

          {/* School Needs + Timeline */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Needs */}
            <section id="needs" className="xl:col-span-2 bg-white rounded-[20px] border border-slate-100 shadow-sm scroll-mt-24">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Infrastructure Needs</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Track classroom & facility requirements</p>
                </div>
                <button className="h-9 px-5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                  + Submit Need
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {needs.map((need) => (
                  <div key={need.label} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-lg shrink-0">{need.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 truncate">{need.label}</span>
                        <span className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${priorityStyles[need.priority]}`}>{need.priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${need.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">{need.progress}%</span>
                      </div>
                    </div>
                    <div className="text-xs font-black text-slate-700 shrink-0">{need.amount}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <TimelineWidget events={timeline} title="Recent Activity" />
          </div>

          {/* Before/After Gallery */}
          <section id="gallery" className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 scroll-mt-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Before & After Gallery</h3>
              <button className="h-9 px-5 border-2 border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:border-blue-400 hover:text-blue-600 transition-all">+ Upload Photos</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {gallery.map((g) => (
                <div key={g.label}>
                  <div className="grid grid-cols-2 gap-3 rounded-[16px] overflow-hidden mb-2">
                    <div className="relative">
                      <img src={g.before} alt="Before" className="w-full h-28 object-cover rounded-xl" />
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">BEFORE</span>
                    </div>
                    <div className="relative">
                      <img src={g.after} alt="After" className="w-full h-28 object-cover rounded-xl" />
                      <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">AFTER</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700">{g.label}</span>
                    <span className="text-[10px] text-slate-400">{g.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reports / Donations Table */}
          <section id="reports" className="scroll-mt-24">
            <DonationTable rows={donations} title="Recent Event & Project Donations" />
          </section>

          {/* Quick Actions / Settings */}
          <section id="settings" className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 scroll-mt-24">
            {quickActions.map(({ icon, label, bg }) => (
              <button
                key={label}
                onClick={() => label.includes("Event") && setIsCreateModalOpen(true)}
                className={`flex flex-col items-center gap-2 p-5 rounded-[20px] border-2 ${bg} shadow-sm transition-all`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-bold text-center leading-tight">{label}</span>
              </button>
            ))}
          </section>

        </main>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      <PostEventUploadModal
        isOpen={!!selectedEventForUpload}
        onClose={() => setSelectedEventForUpload(null)}
        event={selectedEventForUpload}
        onSubmitReport={handlePostReport}
      />
    </div>
  );
};

export default SchoolDashboard;
