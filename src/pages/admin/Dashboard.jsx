import { FaSchool, FaHandsHelping, FaUsers, FaRupeeSign, FaArrowUp, FaCheckCircle, FaClock, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

const stats = [
  { label: "Total Schools", value: "248", change: "+12 this month", icon: FaSchool, color: "bg-blue-100 text-blue-600" },
  { label: "Total Donors", value: "1,842", change: "+134 this month", icon: FaUsers, color: "bg-emerald-100 text-emerald-600" },
  { label: "Active NGOs", value: "36", change: "+3 this month", icon: FaHandsHelping, color: "bg-purple-100 text-purple-600" },
  { label: "Funds Raised", value: "₹2.4Cr", change: "+₹18L this month", icon: FaRupeeSign, color: "bg-green-100 text-green-600" },
];

const recentDonations = [
  { donor: "Rajesh Kumar", school: "GPS Koramangala", amount: "₹25,000", time: "2 hrs ago", status: "completed" },
  { donor: "Anita Desai", school: "ZPS Whitefield", amount: "₹10,000", time: "4 hrs ago", status: "completed" },
  { donor: "Vikram Shah", school: "GHS Hebbal", amount: "₹50,000", time: "6 hrs ago", status: "pending" },
  { donor: "Meena Iyer", school: "GPS Yelahanka", amount: "₹5,000", time: "1 day ago", status: "completed" },
  { donor: "Suresh Patil", school: "ZPS Doddaballapur", amount: "₹15,000", time: "1 day ago", status: "completed" },
];

const topSchools = [
  { name: "GPS Koramangala", district: "Bengaluru Urban", raised: "₹3,20,000", progress: 85 },
  { name: "ZPS Whitefield", district: "Bengaluru Urban", raised: "₹2,80,000", progress: 72 },
  { name: "GHS Hebbal", district: "Bengaluru North", raised: "₹2,40,000", progress: 68 },
  { name: "GPS Indiranagar", district: "Bengaluru Urban", raised: "₹1,95,000", progress: 55 },
];

const systemAlerts = [
  { type: "warning", message: "5 school registrations pending approval", icon: FaClock },
  { type: "error", message: "2 NGO verifications flagged for review", icon: FaExclamationTriangle },
  { type: "success", message: "Monthly report generated successfully", icon: FaCheckCircle },
];

const alertStyles = {
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  error: "bg-red-50 border-red-200 text-red-700",
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview — VIDYADAAN</p>
        </div>
        <Link to="/admin/reports">
          <Button size="sm" variant="outline">
            <FaArrowRight size={13} /> View Reports
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
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <FaArrowUp size={9} /> {s.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* System Alerts */}
      <div className="space-y-2">
        {systemAlerts.map((alert, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${alertStyles[alert.type]}`}>
            <alert.icon size={15} />
            {alert.message}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Recent Donations</h2>
            <Link to="/admin/donations" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <FaArrowRight size={11} />
            </Link>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Donor</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">School</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Amount</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-slate-50 transition">
                      <td className="px-5 py-3 font-medium text-slate-800">{d.donor}</td>
                      <td className="px-5 py-3 text-slate-500">{d.school}</td>
                      <td className="px-5 py-3 text-right font-semibold text-emerald-600">{d.amount}</td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant={d.status === "completed" ? "emerald" : "yellow"} className="capitalize">{d.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400 text-xs">{d.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Top Schools + Quick Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Top Funded Schools</h2>
          <Card className="p-5 space-y-4">
            {topSchools.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.district}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">{s.raised}</span>
                </div>
                <ProgressBar value={s.progress} color={s.progress >= 75 ? "emerald" : "blue"} showLabel={false} />
              </div>
            ))}
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Approve Schools", to: "/admin/schools", color: "text-blue-600" },
                { label: "Verify NGOs", to: "/admin/ngos", color: "text-purple-600" },
                { label: "Manage Users", to: "/admin/users", color: "text-slate-600" },
                { label: "View Analytics", to: "/admin/analytics", color: "text-emerald-600" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition text-sm font-medium ${item.color}`}
                >
                  {item.label}
                  <FaArrowRight size={11} />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
