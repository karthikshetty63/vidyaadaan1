import { useState } from "react";
import { FaSearch, FaUserPlus, FaUsers, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const volunteers = [
  { id: 1, name: "Priya Sharma", role: "Field Coordinator", email: "priya.sharma@email.com", phone: "9876501001", city: "Bengaluru", status: "active", projects: 3, hours: 120, joined: "Jan 2025", avatar: "PS" },
  { id: 2, name: "Arjun Mehta", role: "Tech Volunteer", email: "arjun.mehta@email.com", phone: "9876501002", city: "Bengaluru", status: "active", projects: 2, hours: 85, joined: "Mar 2025", avatar: "AM" },
  { id: 3, name: "Deepa Nair", role: "Education Trainer", email: "deepa.nair@email.com", phone: "9876501003", city: "Mysuru", status: "active", projects: 4, hours: 200, joined: "Nov 2024", avatar: "DN" },
  { id: 4, name: "Rahul Verma", role: "Construction Supervisor", email: "rahul.verma@email.com", phone: "9876501004", city: "Bengaluru", status: "active", projects: 2, hours: 95, joined: "Feb 2025", avatar: "RV" },
  { id: 5, name: "Sneha Kulkarni", role: "Field Coordinator", email: "sneha.k@email.com", phone: "9876501005", city: "Hubli", status: "inactive", projects: 1, hours: 40, joined: "Jun 2025", avatar: "SK" },
  { id: 6, name: "Vikram Joshi", role: "Tech Volunteer", email: "vikram.j@email.com", phone: "9876501006", city: "Bengaluru", status: "active", projects: 1, hours: 30, joined: "Aug 2025", avatar: "VJ" },
  { id: 7, name: "Ananya Reddy", role: "Education Trainer", email: "ananya.r@email.com", phone: "9876501007", city: "Bengaluru", status: "active", projects: 2, hours: 110, joined: "Apr 2025", avatar: "AR" },
  { id: 8, name: "Kiran Patil", role: "Field Coordinator", email: "kiran.p@email.com", phone: "9876501008", city: "Belagavi", status: "inactive", projects: 0, hours: 15, joined: "Sep 2025", avatar: "KP" },
];

const roleColors = {
  "Field Coordinator": "blue",
  "Tech Volunteer": "purple",
  "Education Trainer": "emerald",
  "Construction Supervisor": "slate",
};

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-slate-100 text-slate-700",
];

const Volunteers = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = volunteers.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.role.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || v.status === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Volunteers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your NGO volunteer team</p>
        </div>
        <Button size="sm">
          <FaUserPlus size={14} /> Add Volunteer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Volunteers", value: volunteers.length, color: "text-blue-600" },
          { label: "Active", value: volunteers.filter(v => v.status === "active").length, color: "text-emerald-600" },
          { label: "Inactive", value: volunteers.filter(v => v.status === "inactive").length, color: "text-slate-500" },
          { label: "Total Hours", value: `${totalHours}h`, color: "text-purple-600" },
        ].map((item) => (
          <Card key={item.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search volunteers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Volunteer Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FaUsers size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No volunteers found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((v, i) => (
            <Card key={v.id} hover className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                  {v.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-800 truncate">{v.name}</h3>
                    <Badge variant={v.status === "active" ? "emerald" : "slate"} className="capitalize flex-shrink-0">
                      {v.status}
                    </Badge>
                  </div>
                  <Badge variant={roleColors[v.role] || "blue"} className="mt-1">{v.role}</Badge>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2"><FaEnvelope size={10} className="text-slate-400" /> {v.email}</div>
                <div className="flex items-center gap-2"><FaPhoneAlt size={10} className="text-slate-400" /> {v.phone}</div>
                <div className="flex items-center gap-2"><FaMapMarkerAlt size={10} className="text-slate-400" /> {v.city}</div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div><p className="font-bold text-blue-600">{v.projects}</p><p className="text-slate-400">Projects</p></div>
                <div><p className="font-bold text-emerald-600">{v.hours}h</p><p className="text-slate-400">Hours</p></div>
                <div><p className="font-bold text-slate-600">{v.joined}</p><p className="text-slate-400">Joined</p></div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" fullWidth>View</Button>
                <Button variant="ghost" size="sm" fullWidth>Message</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Volunteers;
