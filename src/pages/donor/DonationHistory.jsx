import { useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { FaSearch } from "react-icons/fa";

const donations = [
  { id: 1, school: "Govt. Higher Primary School", project: "Classroom Roof Repair", amount: 25000, date: "22 Jan 2025", status: "Completed", receipt: "VD-2025-001" },
  { id: 2, school: "Govt. High School, Madikeri", project: "Digital Library Setup", amount: 40000, date: "10 Jan 2025", status: "Active", receipt: "VD-2025-002" },
  { id: 3, school: "Govt. Model School, Mysuru", project: "Library Books", amount: 10000, date: "28 Dec 2024", status: "Active", receipt: "VD-2024-098" },
  { id: 4, school: "Govt. Primary School, Hassan", project: "Science Lab Equipment", amount: 15000, date: "15 Dec 2024", status: "Active", receipt: "VD-2024-087" },
  { id: 5, school: "Govt. Composite School, Udupi", project: "Drinking Water Facility", amount: 8000, date: "01 Dec 2024", status: "Completed", receipt: "VD-2024-075" },
  { id: 6, school: "Govt. High School, Chikmagalur", project: "Playground Development", amount: 5000, date: "20 Nov 2024", status: "Active", receipt: "VD-2024-062" },
];

const statusVariant = { Active: "blue", Completed: "emerald" };
const filters = ["All", "Active", "Completed"];

const DonorDonationHistory = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = donations.filter((d) => {
    const matchFilter = filter === "All" || d.status === filter;
    const matchSearch =
      d.school.toLowerCase().includes(search.toLowerCase()) ||
      d.project.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const completed = donations.filter((d) => d.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Donation History</h1>
        <p className="text-slate-500 text-sm mt-1">All your contributions on VIDYADAAN</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Donated", value: `₹${total.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Total Donations", value: donations.length, color: "text-blue-600" },
          { label: "Completed Projects", value: completed, color: "text-emerald-500" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2.5 gap-2 flex-1">
            <FaSearch className="text-slate-400 text-sm shrink-0" />
            <input
              type="text"
              placeholder="Search by school or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                {["Receipt", "School", "Project", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-xs text-slate-400 font-mono">{d.receipt}</td>
                  <td className="px-5 py-4 font-medium text-slate-800 max-w-[180px] truncate">{d.school}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-[160px] truncate">{d.project}</td>
                  <td className="px-5 py-4 font-bold text-emerald-600 whitespace-nowrap">
                    ₹{d.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{d.date}</td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[d.status]}>{d.status}</Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No donations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DonorDonationHistory;
