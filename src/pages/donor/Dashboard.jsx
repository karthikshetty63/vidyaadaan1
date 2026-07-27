import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { FaDonate, FaSchool, FaBookmark, FaHeart, FaArrowRight } from "react-icons/fa";
import schoolsData from "../../data/schoolsData";

const stats = [
  { label: "Total Donated", value: "₹75,000", icon: FaDonate, bg: "bg-emerald-50", color: "text-emerald-600" },
  { label: "Schools Supported", value: "4", icon: FaSchool, bg: "bg-blue-50", color: "text-blue-600" },
  { label: "Saved Projects", value: "6", icon: FaBookmark, bg: "bg-blue-50", color: "text-blue-500" },
  { label: "Impact Score", value: "92", icon: FaHeart, bg: "bg-emerald-50", color: "text-emerald-500" },
];

const recentDonations = [
  { project: "Classroom Roof Repair", school: "Govt. Higher Primary School", amount: "₹25,000", date: "22 Jan 2025", status: "Completed" },
  { project: "Digital Blackboard", school: "Govt. High School, Madikeri", amount: "₹40,000", date: "10 Jan 2025", status: "Active" },
  { project: "Library Books", school: "Govt. Model School, Mysuru", amount: "₹10,000", date: "28 Dec 2024", status: "Active" },
];

const DonorDashboard = () => {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Donor Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, Priya Sharma</p>
        </div>
        <Link
          to="/donor/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Browse Schools <FaArrowRight size={12} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
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
        {/* Recent Donations */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800">Recent Donations</h2>
              <Link to="/donor/donation-history" className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-1">
              {recentDonations.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{d.project}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.school}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-emerald-600 text-sm">{d.amount}</p>
                    <Badge variant={d.status === "Completed" ? "emerald" : "blue"}>{d.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recommended Schools */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800">Recommended</h2>
              <Link to="/donor/browse" className="text-sm text-blue-600 hover:underline">
                Browse All
              </Link>
            </div>
            <div className="space-y-4">
              {schoolsData.slice(0, 3).map((s) => (
                <Link key={s.id} to={`/donor/school/${s.id}`} className="block border border-gray-100 rounded-xl p-3 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
                  <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.location}</p>
                  <ProgressBar value={s.progress} className="mt-2" showLabel={false} />
                  <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                    <span className="text-emerald-600 font-medium">{s.raised}</span>
                    <span className="text-slate-400">of {s.required}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Impact Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-lg">Your donations have impacted 1,200+ students!</p>
          <p className="text-blue-100 text-sm mt-1">Keep going — every rupee makes a difference.</p>
        </div>
        <Link
          to="/donor/browse"
          className="shrink-0 px-6 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors duration-200"
        >
          Donate Again
        </Link>
      </div>
    </div>
  );
};

export default DonorDashboard;
