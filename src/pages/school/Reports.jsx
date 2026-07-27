import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import Badge from "../../components/ui/Badge";

const projectReports = [
  { title: "Classroom Roof Repair", raised: 65000, goal: 100000, progress: 65, status: "Active" },
  { title: "Digital Blackboard", raised: 80000, goal: 80000, progress: 100, status: "Completed" },
  { title: "Toilet Block Renovation", raised: 120000, goal: 120000, progress: 100, status: "Completed" },
  { title: "Library Books", raised: 22500, goal: 50000, progress: 45, status: "Active" },
];

const statusVariant = { Active: "blue", Completed: "emerald" };

const SchoolReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your school's donation and project performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Raised", value: "₹2,87,500", color: "text-emerald-600" },
          { label: "Total Goal", value: "₹3,50,000", color: "text-blue-600" },
          { label: "Completed", value: "2", color: "text-emerald-600" },
          { label: "Active", value: "2", color: "text-blue-600" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Project Breakdown */}
      <Card className="p-6">
        <h2 className="font-bold text-slate-800 mb-5">Project Breakdown</h2>
        <div className="space-y-5">
          {projectReports.map((p) => (
            <div key={p.title} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
              </div>
              <ProgressBar value={p.progress} />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Raised: <strong className="text-slate-700">₹{p.raised.toLocaleString()}</strong></span>
                <span>Goal: <strong className="text-slate-700">₹{p.goal.toLocaleString()}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SchoolReports;
