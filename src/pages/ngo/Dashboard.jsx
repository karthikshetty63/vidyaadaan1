import { FaProjectDiagram, FaSchool, FaUsers, FaCheckCircle, FaClock, FaChartLine, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

const stats = [
  { label: "Assigned Projects", value: "12", icon: FaProjectDiagram, color: "bg-blue-100 text-blue-600", change: "+2 this month" },
  { label: "Schools Supported", value: "8", icon: FaSchool, color: "bg-emerald-100 text-emerald-600", change: "+1 this month" },
  { label: "Active Volunteers", value: "34", icon: FaUsers, color: "bg-purple-100 text-purple-600", change: "+5 this month" },
  { label: "Projects Completed", value: "27", icon: FaCheckCircle, color: "bg-green-100 text-green-600", change: "All time" },
];

const activeProjects = [
  { id: 1, title: "Library Renovation – Govt. Primary School", school: "GPS Koramangala", progress: 72, status: "active", deadline: "Dec 2025", raised: "₹1,44,000", goal: "₹2,00,000" },
  { id: 2, title: "Computer Lab Setup – Zilla Parishad School", school: "ZPS Whitefield", progress: 45, status: "active", deadline: "Jan 2026", raised: "₹90,000", goal: "₹2,00,000" },
  { id: 3, title: "Toilet Block Construction", school: "GPS Yelahanka", progress: 88, status: "active", deadline: "Nov 2025", raised: "₹1,76,000", goal: "₹2,00,000" },
  { id: 4, title: "Drinking Water Facility", school: "GPS Hebbal", progress: 30, status: "pending", deadline: "Feb 2026", raised: "₹45,000", goal: "₹1,50,000" },
];

const recentActivity = [
  { id: 1, text: "New project assigned: Playground Equipment – GPS Indiranagar", time: "2 hours ago", type: "project" },
  { id: 2, text: "Volunteer Priya Sharma joined Library Renovation project", time: "5 hours ago", type: "volunteer" },
  { id: 3, text: "Donation of ₹25,000 received for Computer Lab Setup", time: "1 day ago", type: "donation" },
  { id: 4, text: "Project milestone reached: Toilet Block 80% complete", time: "2 days ago", type: "milestone" },
  { id: 5, text: "School visit scheduled: ZPS Whitefield on 28 Nov", time: "3 days ago", type: "visit" },
];

const activityColors = {
  project: "bg-blue-500",
  volunteer: "bg-purple-500",
  donation: "bg-emerald-500",
  milestone: "bg-green-500",
  visit: "bg-blue-400",
};

const statusBadge = { active: "emerald", pending: "yellow" };

const NGODashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">NGO Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, Shiksha Foundation</p>
        </div>
        <Link to="/ngo/projects">
          <Button size="sm">
            <FaProjectDiagram size={14} /> View All Projects
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{s.value}</p>
                <p className="text-xs text-emerald-600 mt-1">{s.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Active Projects</h2>
            <Link to="/ngo/projects" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <FaArrowRight size={11} />
            </Link>
          </div>
          {activeProjects.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.school}</p>
                </div>
                <Badge variant={statusBadge[p.status]} className="self-start capitalize">{p.status}</Badge>
              </div>
              <ProgressBar value={p.progress} color={p.progress >= 75 ? "emerald" : "blue"} showLabel={false} />
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>{p.raised} of {p.goal}</span>
                <span className="flex items-center gap-1"><FaClock size={10} /> {p.deadline}</span>
                <span className="font-semibold text-blue-600">{p.progress}%</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
          <Card className="p-5">
            <div className="space-y-4">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activityColors[a.type]}`} />
                  <div>
                    <p className="text-sm text-slate-700">{a.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Impact Summary */}
          <Card className="p-5 bg-gradient-to-br from-blue-600 to-emerald-600 text-white border-0">
            <div className="flex items-center gap-2 mb-3">
              <FaChartLine size={16} />
              <h3 className="font-semibold">Monthly Impact</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-blue-100">Funds Mobilized</span><span className="font-bold">₹4,55,000</span></div>
              <div className="flex justify-between"><span className="text-blue-100">Students Benefited</span><span className="font-bold">1,240</span></div>
              <div className="flex justify-between"><span className="text-blue-100">Volunteer Hours</span><span className="font-bold">320 hrs</span></div>
              <div className="flex justify-between"><span className="text-blue-100">Site Visits</span><span className="font-bold">6</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
