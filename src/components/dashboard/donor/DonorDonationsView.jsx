import { Link } from "react-router-dom";
import { LuHandCoins, LuHeart, LuSchool } from "react-icons/lu";
import ReportDownloads from "../ReportDownloads";
import Alert from "../../ui/Alert";
import Card, { CardHeader } from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import PageHeader from "../../ui/PageHeader";
import StatCard from "../../ui/StatCard";
import { buttonClasses } from "../../ui/classes";
import { formatINR } from "../../../utils/format";
import { displayValue } from "../../../utils/report";
import { buildDonorReport } from "../../../utils/reportCards";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** The donor's own confirmed donations: totals, every receipt, and the report card to download. */
const DonorDonationsView = ({ user, donations, loading, error, onRetry, notice }) => {
  const given = donations.reduce((sum, d) => sum + d.amount, 0);
  const needs = new Set(donations.map((d) => d.project.id)).size;
  const schools = new Set(donations.map((d) => d.school.name)).size;
  return (
    <>
      <PageHeader
        title="My donations"
        description="Every donation Razorpay confirmed, with its payment ID as your receipt."
        actions={donations.length > 0 && <ReportDownloads kind="donor" buildReport={() => buildDonorReport({ user, donations })} />}
      />
      {notice}
      {error && (
        <Alert tone="danger">
          {error} <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total given" value={loading ? "–" : formatINR(given)} icon={LuHandCoins} tone="emerald" hint={donations.length ? `In ${plural(donations.length, "donation", "donations")}` : undefined} />
        <StatCard label="Needs supported" value={loading ? "–" : needs} icon={LuHeart} tone="sky" />
        <StatCard label="Schools supported" value={loading ? "–" : schools} icon={LuSchool} tone="violet" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Receipts" description={donations.length ? "Keep the payment ID as your reference." : undefined} />
        {loading && <p className="px-5 py-4 text-sm text-slate-500" role="status">Loading your donations…</p>}
        {!loading && !error && donations.length === 0 && (
          <EmptyState
            icon={LuHandCoins}
            title="No donations yet"
            description="When you donate to a school need, it appears here once Razorpay confirms the payment, with its payment ID as your receipt."
            action={<Link to="#needs" className={buttonClasses({ variant: "secondary" })}>Browse school needs</Link>}
          />
        )}
        {donations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Your confirmed donations, newest first</caption>
              <thead>
                <tr className="border-b border-surface-divider bg-surface-muted text-left">
                  {["Date", "School need", "School", "Amount", "Payment ID"].map((h) => (
                    <th key={h} scope="col" className={`whitespace-nowrap px-5 py-2.5 text-xs font-medium text-slate-500 ${h === "Amount" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-divider">
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{displayValue(d.verifiedAt || d.createdAt, "date")}</td>
                    <td className="min-w-44 px-5 py-3 font-medium text-slate-900">{d.project.title}</td>
                    <td className="min-w-40 px-5 py-3 text-slate-600">
                      {d.school.name}
                      {(d.school.district || d.school.state) && <span className="block text-xs text-slate-500">{[d.school.district, d.school.state].filter(Boolean).join(", ")}</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums text-slate-900">{formatINR(d.amount)}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-600">
                      {d.paymentId}
                      {d.mode === "test" && <span className="ml-2 rounded-full bg-amber-50 px-1.5 py-0.5 font-sans text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">Test</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};

export default DonorDonationsView;
