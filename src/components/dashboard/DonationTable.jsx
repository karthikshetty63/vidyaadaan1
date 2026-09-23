import Card, { CardHeader } from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { StatusBadge } from "../ui/Badge";

const DonationTable = ({ rows = [], title = "Donations" }) => (
  <Card className="overflow-hidden">
    <CardHeader title={title} />
    {rows.length === 0 ? (
      <EmptyState title="No records found" />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              {["Donor / Project", "Amount", "Date", "Purpose", "Status"].map((h) => (
                <th key={h} scope="col" className="px-5 py-2.5 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900 whitespace-nowrap">{row.name || row.project}</p>
                  {row.sub && <p className="text-xs text-slate-500">{row.sub}</p>}
                </td>
                <td className="px-5 py-3 font-medium text-slate-900 tabular-nums whitespace-nowrap">₹{Number(row.amount).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.date}</td>
                <td className="px-5 py-3 text-slate-600 max-w-[16rem] truncate" title={row.purpose}>{row.purpose}</td>
                <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export default DonationTable;
