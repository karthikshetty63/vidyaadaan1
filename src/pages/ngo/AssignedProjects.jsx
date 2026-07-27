import { useState } from "react";
import { FaSearch, FaProjectDiagram, FaSchool, FaClock, FaRupeeSign, FaFilter } from "react-icons/fa";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

const projects = [
  { id: 1, title: "Library Renovation", school: "GPS Koramangala", category: "Infrastructure", status: "active", raised: 144000, goal: 200000, progress: 72, deadline: "Dec 2025", volunteers: 4, description: "Complete renovation of school library including new shelves, books, and reading area." },
  { id: 2, title: "Computer Lab Setup", school: "ZPS Whitefield", category: "Technology", status: "active", raised: 90000, goal: 200000, progress: 45, deadline: "Jan 2026", volunteers: 3, description: "Setting up a 20-computer lab with internet connectivity for digital literacy." },
  { id: 3, title: "Toilet Block Construction", school: "GPS Yelahanka", category: "Sanitation", status: "active", raised: 176000, goal: 200000, progress: 88, deadline: "Nov 2025", volunteers: 6, description: "Construction of separate toilet blocks for boys and girls with proper sanitation." },
  { id: 4, title: "Drinking Water Facility", school: "GPS Hebbal", category: "Water", status: "pending", raised: 45000, goal: 150000, progress: 30, deadline: "Feb 2026", volunteers: 2, description: "Installation of RO water purifier and storage tanks for clean drinking water." },
  { id: 5, title: "Playground Equipment", school: "GPS Indiranagar", category: "Sports", status: "pending", raised: 20000, goal: 80000, progress: 25, deadline: "Mar 2026", volunteers: 2, description: "Installation of swings, slides, and other playground equipment for students." },
  { id: 6, title: "Classroom Renovation", school: "ZPS Doddaballapur", category: "Infrastructure", status: "completed", raised: 120000, goal: 120000, progress: 100, deadline: "Oct 2025", volunteers: 5, description: "Renovation of 4 classrooms with new furniture, whiteboard, and painting." },
  { id: 7, title: "Science Lab Equipment", school: "GHS Devanahalli", category: "Technology", status: "completed", raised: 95000, goal: 95000, progress: 100, deadline: "Sep 2025", volunteers: 3, description: "Procurement and installation of science lab equipment for classes 8-10." },
];

const statusVariant = { active: "emerald", pending: "yellow", completed: "blue" };
const tabs = ["All", "Active", "Pending", "Completed"];

const AssignedProjects = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.school.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "All" || p.status === activeTab.toLowerCase();
    return matchSearch && matchTab;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Assigned Projects</h1>
        <p className="text-slate-500 text-sm mt-1">{projects.length} projects assigned to your NGO</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: projects.length, color: "text-blue-600" },
          { label: "Active", value: projects.filter(p => p.status === "active").length, color: "text-emerald-600" },
          { label: "Pending", value: projects.filter(p => p.status === "pending").length, color: "text-yellow-600" },
          { label: "Completed", value: projects.filter(p => p.status === "completed").length, color: "text-blue-500" },
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
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === t ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FaProjectDiagram size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No projects found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <Card key={p.id} hover className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-3">
                  <h3 className="font-semibold text-slate-800">{p.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <FaSchool size={10} /> {p.school}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={statusVariant[p.status]} className="capitalize">{p.status}</Badge>
                  <Badge variant="slate">{p.category}</Badge>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-2 mb-3">{p.description}</p>

              <ProgressBar
                value={p.progress}
                color={p.status === "completed" ? "blue" : p.progress >= 75 ? "emerald" : "blue"}
                showLabel={false}
              />

              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FaRupeeSign size={9} />
                  {(p.raised / 1000).toFixed(0)}K / {(p.goal / 1000).toFixed(0)}K
                </span>
                <span className="flex items-center gap-1"><FaClock size={10} /> {p.deadline}</span>
                <span className="font-semibold text-blue-600">{p.progress}%</span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{p.volunteers} volunteers assigned</span>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedProjects;
