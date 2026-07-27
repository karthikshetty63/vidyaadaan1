import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import { FaPlus, FaSearch } from "react-icons/fa";

const issues = [
  { id: 1, title: "Classroom Roof Repair", category: "Infrastructure", status: "Active", progress: 65, raised: "₹65,000", goal: "₹1,00,000", date: "12 Jan 2025" },
  { id: 2, title: "New Desks & Benches", category: "Furniture", status: "Pending", progress: 20, raised: "₹10,000", goal: "₹50,000", date: "18 Jan 2025" },
  { id: 3, title: "Digital Blackboard", category: "Digital", status: "Completed", progress: 100, raised: "₹80,000", goal: "₹80,000", date: "05 Dec 2024" },
  { id: 4, title: "Library Books", category: "Library", status: "Active", progress: 45, raised: "₹22,500", goal: "₹50,000", date: "20 Jan 2025" },
  { id: 5, title: "Toilet Block Renovation", category: "Sanitation", status: "Completed", progress: 100, raised: "₹1,20,000", goal: "₹1,20,000", date: "10 Nov 2024" },
];

const statusVariant = { Active: "blue", Pending: "yellow", Completed: "emerald" };
const filters = ["All", "Active", "Pending", "Completed"];

const ManageIssues = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = issues.filter((i) => {
    const matchFilter = filter === "All" || i.status === filter;
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Issues</h1>
          <p className="text-slate-500 text-sm mt-1">{issues.length} total issues</p>
        </div>
        <Link to="/school/create-issue">
          <Button><FaPlus size={12} /> New Issue</Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2 gap-2 flex-1">
            <FaSearch className="text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {filtered.map((issue) => (
          <Card key={issue.id} className="p-5 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-slate-800">{issue.title}</h3>
                  <Badge variant={statusVariant[issue.status]}>{issue.status}</Badge>
                </div>
                <p className="text-xs text-slate-400">{issue.category} · Submitted {issue.date}</p>
                <div className="mt-3 max-w-sm">
                  <ProgressBar value={issue.progress} showLabel={false} />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{issue.raised} raised</span>
                    <span>Goal: {issue.goal}</span>
                  </div>
                </div>
              </div>
              <Link to={`/school/manage-issues/${issue.id}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">No issues found.</div>
        )}
      </div>
    </div>
  );
};

export default ManageIssues;
