import { useState } from "react";
import { LuCalendarDays, LuClipboardList, LuSchool, LuUsers, LuWallet } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import StatsWidget from "../../../components/dashboard/StatsWidget";
import DonationTable from "../../../components/dashboard/DonationTable";
import TimelineWidget from "../../../components/dashboard/TimelineWidget";
import NeedCard from "../../../components/dashboard/NeedCard";
import EventCard from "../../../components/events/EventCard";
import SponsorEventModal from "../../../components/events/SponsorEventModal";
import NGOProjectSupportModal from "../../../components/dashboard/NGOProjectSupportModal";
import { StatusBadge } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card, { CardHeader } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import SectionHeader from "../../../components/ui/SectionHeader";
import SegmentedControl from "../../../components/ui/SegmentedControl";
import { initialEvents } from "../../../data/events";
import { getFundingPercentage } from "../../../utils/funding";

const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ─── MOCK DATA ─────────────────────────────────────────── */
const stats = [
  { icon: LuSchool, label: "Schools supported", value: "14", change: 4 },
  { icon: LuCalendarDays, label: "Events partnered", value: "5", change: 2 },
  { icon: LuUsers, label: "Active volunteers", value: "67", change: 11 },
  { icon: LuWallet, label: "Funds & items managed", value: "₹8.4L", change: 18 },
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

const queue = [
  { school: "Govt. HS Shikaripura", district: "Shivamogga", need: "Library Books", date: "25 Jul", urgency: "Urgent", students: 320 },
  { school: "Govt. Primary Honnali", district: "Davangere", need: "Water Purifier", date: "23 Jul", urgency: "High", students: 438 },
  { school: "GTHS Chitradurga", district: "Chitradurga", need: "Smart Board", date: "20 Jul", urgency: "Medium", students: 511 },
  { school: "GPS Tumkur", district: "Tumkur", need: "Toilet Renovation", date: "18 Jul", urgency: "Urgent", students: 290 },
];

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

/* ─── NGO DASHBOARD ─────────────────────────────────────── */
const NGODashboard = () => {
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState(initialEvents);
  const [schoolNeeds, setSchoolNeeds] = useState(directSchoolNeedsList);
  const [needCategory, setNeedCategory] = useState("All");
  const [selectedEventForSponsor, setSelectedEventForSponsor] = useState(null);
  const [selectedNeedForDonate, setSelectedNeedForDonate] = useState(null);

  const handleNeedDonateSuccess = ({ needLabel, amount }) => {
    setSchoolNeeds((prev) =>
      prev.map((n) => {
        if (n.label === needLabel) {
          const targetNum = typeof n.amount === "number" ? n.amount : parseInt(n.amount.replace(/[^0-9]/g, "")) || 45000;
          const currentRaised = Math.round((targetNum * n.progress) / 100);
          const newRaised = currentRaised + amount;
          const newPct = getFundingPercentage(targetNum, newRaised);
          return { ...n, progress: newPct };
        }
        return n;
      })
    );
  };

  const handleSponsorSuccess = ({ eventId, donorName, totalAmt, sponsoredItemIds }) => {
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

  const filteredNeeds = schoolNeeds.filter((n) => needCategory === "All" || n.category === needCategory);
  const openEvents = eventsList.filter((e) => e.status !== "Completed").length;

  return (
    <DashboardLayout
      role="ngo"
      userName={user?.name || "NGO Partner"}
      userSub={user?.email || "Verified NGO"}
      title="NGO dashboard"
      subtitle={user?.name || "NGO partner"}
    >
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <section id="overview" className="scroll-mt-6 space-y-6">
            <PageHeader
              title={user?.name || "NGO dashboard"}
              description="Review school needs and event requests, coordinate volunteers and track funding."
              actions={<Button onClick={() => scrollToSection("needs")}>Review school needs</Button>}
            />
            <StatsWidget stats={stats} />
          </section>

          <section id="needs" aria-labelledby="needs-heading" className="scroll-mt-6 space-y-4">
            <SectionHeader
              id="needs-heading"
              title="School infrastructure needs"
              description="Classrooms, toilets, drinking water, library books, computers and solar power."
              actions={
                <SegmentedControl
                  label="Filter needs by category"
                  value={needCategory}
                  onChange={setNeedCategory}
                  options={["All", "Classroom", "Water & Sanitation", "Library", "Digital Labs"].map((c) => ({ value: c, label: c }))}
                />
              }
            />
            {filteredNeeds.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredNeeds.map((need) => (
                  <NeedCard key={need.id} need={need} actionLabel="Review & support" onAction={setSelectedNeedForDonate} />
                ))}
              </div>
            ) : (
              <Card><EmptyState title="No needs in this category" description="Try another category." /></Card>
            )}
          </section>

          <section id="events" aria-labelledby="events-heading" className="scroll-mt-6 space-y-4">
            <SectionHeader
              id="events-heading"
              title="School event requests"
              description={`${openEvents} event${openEvents === 1 ? "" : "s"} looking for an NGO partner.`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card as="section" id="schools" className="xl:col-span-2 scroll-mt-6">
              <CardHeader title="School priority queue" description="Schools awaiting review and support" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-left">
                      {["School", "Need", "Students", "Requested", "Urgency"].map((h) => (
                        <th key={h} scope="col" className="px-5 py-2.5 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queue.map((item) => (
                      <tr key={item.school} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900 whitespace-nowrap">{item.school}</p>
                          <p className="text-xs text-slate-500">{item.district}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-700 whitespace-nowrap">{item.need}</td>
                        <td className="px-5 py-3 text-slate-600 tabular-nums">{item.students}</td>
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{item.date}</td>
                        <td className="px-5 py-3"><StatusBadge status={item.urgency} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <TimelineWidget events={timeline} title="NGO activity" />
          </div>

          <Card as="section" id="volunteers" className="scroll-mt-6">
            <CardHeader title="Volunteers" description={`${volunteers.length} volunteers and their current assignments`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    {["Volunteer", "Role", "Assigned to", "Status"].map((h) => (
                      <th key={h} scope="col" className="px-5 py-2.5 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteers.map((v) => (
                    <tr key={v.name} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-center shrink-0" aria-hidden="true">{v.name.charAt(0)}</span>
                          <span className="font-medium text-slate-900 whitespace-nowrap">{v.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{v.role}</td>
                      <td className="px-5 py-3 text-slate-600">{v.school}</td>
                      <td className="px-5 py-3"><StatusBadge status={v.status === "Active" ? "active" : "pending"}>{v.status}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <section id="funding" className="scroll-mt-6">
            <DonationTable rows={fundingRows} title="Event & project funding" />
          </section>

          <Card as="section" id="settings" className="scroll-mt-6">
            <CardHeader title="Quick actions" />
            <div className="flex flex-wrap gap-2 p-5">
              <Button variant="secondary" icon={LuClipboardList} onClick={() => scrollToSection("needs")}>Review school needs</Button>
              <Button variant="secondary" icon={LuCalendarDays} onClick={() => scrollToSection("events")}>Review event requests</Button>
            </div>
          </Card>
        </div>
      </main>

      <NGOProjectSupportModal
        isOpen={!!selectedNeedForDonate}
        onClose={() => setSelectedNeedForDonate(null)}
        need={selectedNeedForDonate}
        onSupportSuccess={handleNeedDonateSuccess}
      />

      <SponsorEventModal
        isOpen={!!selectedEventForSponsor}
        onClose={() => setSelectedEventForSponsor(null)}
        event={selectedEventForSponsor}
        onSponsorSuccess={handleSponsorSuccess}
      />
    </DashboardLayout>
  );
};

export default NGODashboard;
