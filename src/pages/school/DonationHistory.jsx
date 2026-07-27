import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const donations = [
  { id: 1, donor: "Priya Sharma", project: "Classroom Roof Repair", amount: "₹25,000", date: "22 Jan 2025", status: "Received" },
  { id: 2, donor: "Suresh Kumar", project: "Digital Blackboard", amount: "₹40,000", date: "15 Jan 2025", status: "Received" },
  { id: 3, donor: "Ananya Rao", project: "Library Books", amount: "₹10,000", date: "10 Jan 2025", status: "Received" },
  { id: 4, donor: "Vikram Nair", project: "Classroom Roof Repair", amount: "₹15,000", date: "05 Jan 2025", status: "Received" },
  { id: 5, donor: "Meera Pillai", project: "New Desks & Benches", amount: "₹8,000", date: "28 Dec 2024", status: "Received" },
  { id: 6, donor: "Ravi Shankar", project: "Toilet Block Renovation", amount: "₹50,000", date: "20 Dec 2024", status: "Received" },
];

const SchoolDonationHistory = () => {
  const total = "₹1,48,000";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Donation History</h1>
        <p className="text-slate-500 text-sm mt-1">All donations received by your school</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Received", value: total, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Donors", value: "6", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Projects", value: "3", color: "text-blue-500", bg: "bg-blue-50" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                {["Donor", "Project", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{d.donor}</td>
                  <td className="px-5 py-4 text-slate-600">{d.project}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-600">{d.amount}</td>
                  <td className="px-5 py-4 text-slate-500">{d.date}</td>
                  <td className="px-5 py-4"><Badge variant="emerald">{d.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SchoolDonationHistory;
