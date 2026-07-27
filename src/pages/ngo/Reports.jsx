import { FaChartBar, FaDownload, FaSchool, FaUsers, FaRupeeSign, FaCheckCircle } from "react-icons/fa";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

const summaryStats = [
  { label: "Total Funds Mobilized", value: "₹18,45,000", sub: "Across all projects", icon: FaRupeeSign, color: "bg-blue-100 text-blue-600" },
  { label: "Students Benefited", value: "4,820", sub: "Across 8 schools", icon: FaUsers, color: "bg-emerald-100 text-emerald-600" },
  { label: "Projects Completed", value: "27", sub: "Since inception", icon: FaCheckCircle, color: "bg-green-100 text-green-600" },
  { label: "Schools Supported", value: "8", sub: "Active partnerships", icon: FaSchool, color: "bg-purple-100 text-purple-600" },
];

const projectBreakdown = [
  { category: "Infrastructure", projects: 8, funds: "₹6,40,000", progress: 78 },
  { category: "Technology", projects: 5, funds: "₹4,20,000", progress: 65 },
  { category: "Sanitation", projects: 6, funds: "₹3,80,000", progress: 85 },
  { category: "Water", projects: 4, funds: "₹2,10,000", progress: 55 },
  { category: "Sports", projects: 4, funds: "₹1,95,000", progress: 40 },
];

const monthlyData = [
  { month: "Jun 2025", funds: "₹1,20,000", projects: 2, volunteers: 5 },
  { month: "Jul 2025", funds: "₹2,40,000", projects: 3, volunteers: 8 },
  { month: "Aug 2025", funds: "₹1,80,000", projects: 2, volunteers: 6 },
  { month: "Sep 2025", funds: "₹3,10,000", projects: 4, volunteers: 10 },
  { month: "Oct 2025", funds: "₹2,60,000", projects: 3, volunteers: 9 },
  { month: "Nov 2025", funds: "₹4,55,000", projects: 5, volunteers: 12 },
];

const schoolImpact = [
  { school: "GPS Koramangala", students: 320, funds: "₹3,20,000", projects: 3, status: "active" },
  { school: "ZPS Whitefield", students: 480, funds: "₹4,10,000", projects: 2, status: "active" },
  { school: "GPS Yelahanka", students: 210, funds: "₹1,80,000", projects: 1, status: "active" },
  { school: "GHS Hebbal", students: 560, funds: "₹5,20,000", projects: 4, status: "active" },
  { school: "GPS Indiranagar", students: 290, funds: "₹2,10,000", projects: 2, status: "active" },
];

const NGOReports = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Impact overview for Shiksha Foundation</p>
        </div>
        <Button variant="outline" size="sm">
          <FaDownload size={13} /> Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Category Breakdown */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Projects by Category</h2>
            <FaChartBar className="text-slate-400" size={16} />
          </div>
          <div className="space-y-4">
            {projectBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{item.projects} projects</span>
                    <span className="font-semibold text-blue-600">{item.funds}</span>
                  </div>
                </div>
                <ProgressBar value={item.progress} color={item.progress >= 75 ? "emerald" : "blue"} showLabel={false} />
                <p className="text-xs text-slate-400 mt-1">{item.progress}% completion rate</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Activity */}
        <Card className="p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Monthly Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-slate-500">Month</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Funds</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Projects</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Volunteers</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, i) => (
                  <tr key={row.month} className={`border-b border-gray-50 ${i === monthlyData.length - 1 ? "bg-blue-50/50" : ""}`}>
                    <td className="py-2.5 text-slate-700 font-medium">{row.month}</td>
                    <td className="py-2.5 text-right text-emerald-600 font-semibold">{row.funds}</td>
                    <td className="py-2.5 text-right text-blue-600 font-semibold">{row.projects}</td>
                    <td className="py-2.5 text-right text-slate-600">{row.volunteers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* School-wise Impact */}
      <Card className="p-5">
        <h2 className="font-semibold text-slate-800 mb-4">School-wise Impact</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-slate-500">School</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500">Students</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500">Funds Utilized</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500">Projects</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {schoolImpact.map((row) => (
                <tr key={row.school} className="border-b border-gray-50 hover:bg-slate-50 transition">
                  <td className="py-3 text-slate-700 font-medium">{row.school}</td>
                  <td className="py-3 text-right text-slate-600">{row.students}</td>
                  <td className="py-3 text-right text-emerald-600 font-semibold">{row.funds}</td>
                  <td className="py-3 text-right text-blue-600 font-semibold">{row.projects}</td>
                  <td className="py-3 text-right">
                    <Badge variant="emerald" className="capitalize">{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default NGOReports;
