import { LuCircleCheck, LuFolderKanban, LuHandCoins, LuUsers } from "react-icons/lu";
import { buildNgoReport } from "../../../utils/reportCards";
import { displayValue } from "../../../utils/report";
import ReportDownloads from "../ReportDownloads";
import Alert from "../../ui/Alert";
import Card, { CardHeader } from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import PageHeader from "../../ui/PageHeader";
import StatCard from "../../ui/StatCard";

/**
 * The NGO's report card: the needs it funds, its payments and its volunteers. The page shows the key
 * figures and the funded needs; the downloads (CSV or Word) contain every section.
 */
const ReportsView = ({ profile, user, funded, payments, volunteers, loading, error, onRetry }) => {
  const report = buildNgoReport({ profile, user, funded, payments, volunteers });
  const figure = (label) => report.summary.find((s) => s.label === label);
  const stats = [
    { label: "School needs funded", icon: LuFolderKanban, tone: "indigo" },
    { label: "Total committed", icon: LuHandCoins, tone: "amber" },
    { label: "Paid and confirmed", icon: LuCircleCheck, tone: "emerald" },
    { label: "Volunteers", icon: LuUsers, tone: "rose" },
  ];
  const needs = report.sections[0];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Your NGO's report card: the school needs you fund, your payments and your volunteers. Download it as a spreadsheet (CSV) or a Word document."
        actions={<ReportDownloads kind="ngo" buildReport={() => buildNgoReport({ profile, user, funded, payments, volunteers })} disabled={loading || Boolean(error)} />}
      />
      {error && (
        <Alert tone="danger">
          {error}{" "}
          <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, icon, tone }) => {
          const s = figure(label);
          return <StatCard key={label} label={label} value={loading ? "–" : displayValue(s.value, s.type)} icon={icon} tone={tone} />;
        })}
      </div>

      <Card className="overflow-hidden">
        <CardHeader title={needs.title} description={needs.description} />
        {loading ? (
          <p className="px-5 py-4 text-sm text-slate-500" role="status">Loading your report…</p>
        ) : needs.rows.length === 0 ? (
          <EmptyState icon={LuFolderKanban} title="Nothing to report yet" description="Fund part or all of a school need and it appears in your report." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-surface-muted text-left">
                  {needs.columns.map((c) => (
                    <th key={c.label} scope="col" className={`whitespace-nowrap px-4 py-2.5 text-xs font-medium text-slate-500 ${c.type === "money" || c.type === "number" ? "text-right" : ""}`}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {needs.rows.map((row, r) => (
                  <tr key={funded[r].id}>
                    {row.map((value, i) => {
                      const type = needs.columns[i].type;
                      const numeric = type === "money" || type === "number";
                      return (
                        <td
                          key={needs.columns[i].label}
                          className={`px-4 py-3 ${i === 0 ? "min-w-48 font-medium text-slate-900" : "text-slate-600"} ${numeric ? "whitespace-nowrap text-right tabular-nums" : i > 0 ? "min-w-36" : ""}`}
                        >
                          {displayValue(value, type)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="text-xs text-slate-500">The downloads also include every payment you made and your volunteers.</p>
    </>
  );
};

export default ReportsView;
