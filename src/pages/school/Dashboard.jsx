import { FaDonate, FaClipboardList, FaCheckCircle, FaBell, FaPlus, FaImages, FaChartBar } from "react-icons/fa";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";

const overviewStats = [
  { label: "Total Donations", value: "₹1,75,000", icon: FaDonate, bg: "bg-blue-50", color: "text-blue-600" },
  { label: "Pending Issues", value: "3", icon: FaClipboardList, bg: "bg-yellow-50", color: "text-yellow-600" },
  { label: "Completed Projects", value: "7", icon: FaCheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
  { label: "Notifications", value: "5", icon: FaBell, bg: "bg-blue-50", color: "text-blue-500" },
];

const recentIssues = [
  { id: 1, title: "Classroom Roof Repair", category: "Infrastructure", status: "Active", progress: 65, raised: "₹65,000", goal: "₹1,00,000" },
  { id: 2, title: "New Desks & Benches", category: "Furniture", status: "Pending", progress: 20, raised: "₹10,000", goal: "₹50,000" },
  { id: 3, title: "Digital Blackboard", category: "Digital", status: "Completed", progress: 100, raised: "₹80,000", goal: "₹80,000" },
];

const quickActions = [
  { label: "Create Issue", icon: FaPlus, to: "/school/create-issue", color: "bg-blue-600 hover:bg-blue-700" },
  { label: "View Gallery", icon: FaImages, to: "/school/gallery", color: "bg-emerald-600 hover:bg-emerald-700" },
  { label: "View Reports", icon: FaChartBar, to: "/school/reports", color: "bg-slate-700 hover:bg-slate-800" },
];

const statusVariant = { Active: "blue", Pending: "yellow", Completed: "emerald" };

const SchoolDashboard = () => {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">School Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Govt. Higher Primary School</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewStats.map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label} className="p-5">
            <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`text-lg ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Issues */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800">Recent Issues</h2>
              <Link to="/school/manage-issues" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-5">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{issue.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{issue.category}</p>
                    </div>
                    <Badge variant={statusVariant[issue.status]}>{issue.status}</Badge>
                  </div>
                  <ProgressBar value={issue.progress} showLabel={false} />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Raised: <strong className="text-slate-700">{issue.raised}</strong></span>
                    <span>Goal: <strong className="text-slate-700">{issue.goal}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-5">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {quickActions.map(({ label, icon: Icon, to, color }) => (
                <Link
                  key={label}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-colors duration-200 ${color}`}
                >
                  <Icon size={15} /> {label}
                </Link>
              ))}
            </div>

            {/* School Info */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">School Info</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">District</span><span className="font-medium text-slate-700">Dakshina Kannada</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Students</span><span className="font-medium text-slate-700">320</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge variant="emerald">Verified</Badge></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
