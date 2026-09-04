import React from "react";

const statusStyles = {
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Verified: "bg-purple-50 text-purple-700 border-purple-200",
};

const DonationTable = ({ rows = [], title = "Donations" }) => {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        <button className="text-xs font-bold text-blue-600 hover:underline">View All →</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Donor / Project", "Amount", "Date", "Purpose", "Status"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                      {(row.name || row.project || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{row.name || row.project}</div>
                      {row.sub && <div className="text-[10px] text-slate-400">{row.sub}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-black text-slate-900">₹{Number(row.amount).toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">{row.date}</td>
                <td className="px-6 py-4 text-xs text-slate-600 font-medium max-w-[120px] truncate">{row.purpose}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles[row.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">No records found.</div>
        )}
      </div>
    </div>
  );
};

export default DonationTable;
