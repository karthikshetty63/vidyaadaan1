import { Link } from "react-router-dom";
import {
  LuBadgeCheck, LuCalendarDays, LuChevronRight, LuCircleCheck, LuFolderKanban, LuHandCoins, LuHeartHandshake, LuQrCode, LuSchool, LuScale, LuShieldAlert,
  LuTriangleAlert, LuUserCheck, LuUsers, LuWallet,
} from "react-icons/lu";
import Alert from "../../ui/Alert";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Card, { CardHeader } from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import useMonitorData from "../../../hooks/useMonitorData";
import { ageOf, formatDateTime, formatINR, formatNumber } from "./format";
import { Freshness } from "./shared";

const Skeleton = ({ className = "" }) => <span className={`block rounded-lg bg-slate-200/70 motion-safe:animate-pulse ${className}`} aria-hidden="true" />;

const partsText = ({ count, amount }) => `${formatNumber(count)} ${count === 1 ? "part" : "parts"} · ${formatINR(amount)}`;
const accountHint = (a) => (a ? `${formatNumber(a.active)} active · ${formatNumber(a.pending)} pending · ${formatNumber(a.rejected)} rejected` : "None yet");

/** One work queue: what's waiting, since when, and where it is handled. */
const QueueRow = ({ icon: Icon, label, count, oldest, to, handledBy }) => (
  <li>
    <Link to={to} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 focus-visible:outline-offset-[-2px]">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${count ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`} aria-hidden="true">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">
          {count ? `Oldest waiting ${ageOf(oldest)}` : "Nothing waiting"}
          {handledBy ? ` · ${handledBy}` : ""}
        </span>
      </span>
      <span className="text-lg font-bold tabular-nums text-slate-900">{formatNumber(count)}</span>
      <LuChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary-600" aria-hidden="true" />
    </Link>
  </li>
);

const SEVERITY = { critical: ["danger", "Money check"], warning: ["warning", "Needs a look"], info: ["neutral", "For awareness"] };

/** One check: its count, what it means, where the data comes from, and examples. */
const CheckRow = ({ check }) => {
  const [tone, label] = SEVERITY[check.severity] || SEVERITY.info;
  const clear = check.count === 0;
  return (
    <li className="px-5 py-4">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg focus-visible:outline-offset-2">
          <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${clear ? "bg-emerald-50 text-emerald-600" : tone === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`} aria-hidden="true">
            {clear ? <LuCircleCheck className="h-4 w-4" /> : <LuTriangleAlert className="h-4 w-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{check.title}</span>
              {!clear && <Badge tone={tone}>{label}</Badge>}
              <Badge tone="neutral">{check.source === "activity log" ? "From the activity log" : "From records"}</Badge>
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">{check.description}</span>
          </span>
          <span className={`text-lg font-bold tabular-nums ${clear ? "text-emerald-700" : "text-slate-900"}`}>{formatNumber(check.count)}</span>
        </summary>
        {check.items.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left">
                  {Object.keys(check.items[0]).map((k) => (
                    <th key={k} scope="col" className="whitespace-nowrap px-3 py-2 font-medium text-slate-500">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {check.items.map((item, i) => (
                  <tr key={i}>
                    {Object.entries(item).map(([k, v]) => (
                      <td key={k} className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {Array.isArray(v) ? v.join(", ") : typeof v === "number" && /amount|raised|expected|budget|Payments|donations/i.test(k) ? formatINR(v) : /At$|since|last/.test(k) && v ? formatDateTime(v) : String(v ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {check.truncated && <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">Showing the first {check.items.length} of {formatNumber(check.count)}.</p>}
          </div>
        )}
      </details>
    </li>
  );
};

/** Money in one place: what each kind of transaction is doing, kept apart. */
const MoneyRow = ({ label, value, hint, tone = "text-slate-900" }) => (
  <div className="flex items-baseline justify-between gap-4 py-2">
    <dt className="text-sm text-slate-600">
      {label}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </dt>
    <dd className={`text-sm font-semibold tabular-nums ${tone}`}>{value}</dd>
  </div>
);

const OverviewSection = ({ onOpenFinance }) => {
  const overview = useMonitorData("overview");
  const checks = useMonitorData("checks");
  const o = overview.data;
  const problems = checks.data ? checks.data.checks.filter((c) => c.count > 0) : [];

  return (
    <div className="space-y-6">
      <Freshness {...overview} hasData={Boolean(o)} />
      {overview.error && !o && (
        <Alert tone="danger" title="The overview couldn't be loaded">
          {overview.error} <button type="button" onClick={overview.refresh} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      <section aria-labelledby="totals-heading">
        <h2 id="totals-heading" className="sr-only">Totals</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {o ? (
            <>
              <StatCard label="Schools" value={formatNumber(o.accounts.school?.total)} icon={LuSchool} tone="sky" hint={accountHint(o.accounts.school)} />
              <StatCard label="NGOs" value={formatNumber(o.accounts.ngo?.total)} icon={LuHeartHandshake} tone="emerald" hint={accountHint(o.accounts.ngo)} />
              <StatCard label="Donors" value={formatNumber(o.accounts.donor?.total)} icon={LuUsers} tone="violet" hint={accountHint(o.accounts.donor)} />
              <StatCard
                label="Projects"
                value={formatNumber(o.projects.total)}
                icon={LuFolderKanban}
                tone="indigo"
                hint={`${formatNumber(o.projects.approved)} approved · ${formatNumber(o.projects.pendingReview)} waiting · ${formatNumber(o.projects.rejected)} rejected`}
              />
              <StatCard label="Raised on projects" value={formatINR(o.funding.raisedOnProjects)} icon={LuWallet} tone="emerald" hint={`of ${formatINR(o.projects.approvedBudget)} in approved budgets`} />
              <StatCard label="Promised by NGOs" value={formatINR(o.commitments.awaitingPayment.amount + o.commitments.paymentSubmitted.amount + o.commitments.received.amount)} icon={LuHandCoins} tone="sky" hint={`${formatINR(o.commitments.received.amount)} of it received`} />
              <StatCard label="Verified donations" value={formatINR(o.donations.PAID.amount)} icon={LuBadgeCheck} tone="emerald" hint={`${formatNumber(o.donations.PAID.count)} donations${o.donations.PAID.test.count ? ` · ${formatNumber(o.donations.PAID.test.count)} in test mode` : ""}`} />
              <StatCard label="Activity, last 24 hours" value={formatNumber(o.activity.last24h.total)} icon={LuShieldAlert} tone={o.activity.last24h.failures ? "rose" : "slate"} hint={`${formatNumber(o.activity.last24h.failures)} failed · ${formatNumber(o.activity.last24h.failedSignIns)} failed sign-ins`} />
            </>
          ) : (
            !overview.error && Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-[118px] rounded-2xl" />)
          )}
        </div>
      </section>

      {o && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader title="Work waiting" description="Pending reviews and checks, oldest first." />
            <ul className="divide-y divide-slate-100">
              <QueueRow icon={LuUserCheck} label="Registrations to approve" count={o.queues.accounts.count} oldest={o.queues.accounts.oldest} to="/dashboard/admin" />
              <QueueRow icon={LuFolderKanban} label="Projects to review" count={o.queues.projects.count} oldest={o.queues.projects.oldest} to="/dashboard/admin?tab=projects" />
              <QueueRow icon={LuCalendarDays} label="Events to review" count={o.queues.events.count} oldest={o.queues.events.oldest} to="/dashboard/admin?tab=events" />
              <QueueRow icon={LuQrCode} label="Payment QRs to review" count={o.queues.paymentQrs.count} oldest={o.queues.paymentQrs.oldest} to="/dashboard/admin?tab=qrs" />
              <QueueRow
                icon={LuWallet}
                label="NGO payments schools haven't checked"
                count={o.queues.schoolPaymentChecks.count}
                oldest={o.queues.schoolPaymentChecks.oldest}
                to="/dashboard/admin/control-tower?view=finance&status=SUBMITTED"
                handledBy="schools accept or reject these"
              />
            </ul>
          </Card>

          <Card>
            <CardHeader title="Money check" description="“Raised” on projects against the records it must add up to." />
            <div className="px-5 py-4">
              <dl className="divide-y divide-slate-100">
                <MoneyRow label="Raised on all projects" value={formatINR(o.funding.raisedOnProjects)} />
                <MoneyRow label="Accepted NGO payments" hint="Direct payments schools accepted, and verified online payments" value={formatINR(o.funding.confirmedNgoPayments)} />
                <MoneyRow label="Verified donations" hint="Razorpay signature verified by the server" value={formatINR(o.funding.confirmedDonations)} />
                <MoneyRow
                  label="Difference"
                  value={o.funding.difference === 0 ? "None" : formatINR(o.funding.difference)}
                  tone={o.funding.difference === 0 ? "text-emerald-700" : "text-red-700"}
                />
              </dl>
              {o.funding.difference !== 0 && (
                <p className="mt-2 text-xs text-red-700">The totals don&rsquo;t match. The checks below name the projects involved.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {o && (
        <Card>
          <CardHeader
            title="Transactions by state"
            description="Commitments are promises, not money. Only accepted NGO payments and verified donations count as raised."
            actions={<Button size="sm" variant="secondary" onClick={() => onOpenFinance()}>Open finance</Button>}
          />
          <div className="grid grid-cols-1 gap-x-8 px-5 py-4 md:grid-cols-3">
            <dl className="divide-y divide-slate-100">
              <p className="pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">NGO commitments</p>
              <MoneyRow label="Not paid yet" value={partsText(o.commitments.awaitingPayment)} />
              <MoneyRow label="Paid, school to check" value={partsText(o.commitments.paymentSubmitted)} />
              <MoneyRow label="Received" value={partsText(o.commitments.received)} tone="text-emerald-700" />
            </dl>
            <dl className="divide-y divide-slate-100">
              <p className="pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">NGO payments</p>
              <MoneyRow label="Direct, waiting for school" value={`${formatNumber(o.ngoPayments.direct.SUBMITTED.count)} · ${formatINR(o.ngoPayments.direct.SUBMITTED.amount)}`} />
              <MoneyRow label="Direct, accepted" value={`${formatNumber(o.ngoPayments.direct.ACCEPTED.count)} · ${formatINR(o.ngoPayments.direct.ACCEPTED.amount)}`} tone="text-emerald-700" />
              <MoneyRow label="Direct, rejected" value={`${formatNumber(o.ngoPayments.direct.REJECTED.count)} · ${formatINR(o.ngoPayments.direct.REJECTED.amount)}`} />
              <MoneyRow label="Online, verified" value={`${formatNumber(o.ngoPayments.online.ACCEPTED.count)} · ${formatINR(o.ngoPayments.online.ACCEPTED.amount)}`} tone="text-emerald-700" />
              <MoneyRow label="Online, started not paid" value={`${formatNumber(o.ngoPayments.online.CREATED.count)} · ${formatINR(o.ngoPayments.online.CREATED.amount)}`} />
              <MoneyRow label="Online, refund due" value={`${formatNumber(o.ngoPayments.online.REFUND_DUE.count)} · ${formatINR(o.ngoPayments.online.REFUND_DUE.amount)}`} tone={o.ngoPayments.online.REFUND_DUE.count ? "text-red-700" : "text-slate-900"} />
            </dl>
            <dl className="divide-y divide-slate-100">
              <p className="pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Donations</p>
              <MoneyRow label="Verified" value={`${formatNumber(o.donations.PAID.count)} · ${formatINR(o.donations.PAID.amount)}`} tone="text-emerald-700" />
              <MoneyRow label="Of which test mode" hint="No real money moved" value={`${formatNumber(o.donations.PAID.test.count)} · ${formatINR(o.donations.PAID.test.amount)}`} />
              <MoneyRow label="Started, not completed" hint="Never counted" value={`${formatNumber(o.donations.CREATED.count)} · ${formatINR(o.donations.CREATED.amount)}`} />
            </dl>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardHeader
          title="Checks"
          description={checks.data ? (problems.length ? `${problems.length} of ${checks.data.checks.length} checks found something. Open one to see examples.` : "Every check is clear.") : "Inconsistencies and activity worth a look."}
          actions={<LuScale className="h-5 w-5 text-slate-400" aria-hidden="true" />}
        />
        {checks.error && !checks.data && <p className="px-5 py-4 text-sm text-red-700">The checks couldn&rsquo;t be loaded: {checks.error}</p>}
        {!checks.data && !checks.error && (
          <div className="space-y-3 px-5 py-4" role="status">
            <span className="sr-only">Loading checks…</span>
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        )}
        {checks.data && (
          <ul className="divide-y divide-slate-100">
            {[...checks.data.checks].sort((a, b) => (b.count > 0) - (a.count > 0)).map((c) => <CheckRow key={c.key} check={c} />)}
          </ul>
        )}
      </Card>

      {o && (
        <Alert tone="neutral" title="What the activity log covers">
          {o.activity.liveSince ? `Actions are recorded as they happen since ${formatDateTime(o.activity.liveSince)}.` : "No activity has been recorded yet."}{" "}
          {o.activity.historyImportedAt
            ? `${formatNumber(o.activity.historyImported)} earlier events were rebuilt from the records then; they show only each record's latest state (for example, a project's latest submission), and sign-ins, withdrawn commitments and profile edits from before that were never recorded.`
            : "Earlier events haven't been imported from the records yet (this happens when the server starts)."}
        </Alert>
      )}
    </div>
  );
};

export default OverviewSection;
