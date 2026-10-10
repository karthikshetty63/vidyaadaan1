import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import Alert from "../../ui/Alert";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import { Input, Select } from "../../ui/FormField";
import Modal from "../../ui/Modal";
import useMonitorData from "../../../hooks/useMonitorData";
import { formatDate, formatDateTime, formatINR, formatNumber } from "./format";
import { DataTable, Facts, Freshness, Pager, RoleBadge, StatusBadge } from "./shared";

const place = (...parts) => parts.filter(Boolean).join(", ") || "—";
const ACCOUNT_FILTER = { name: "status", label: "Account status", options: [["", "Any status"], ["active", "Active"], ["pending", "Pending"], ["rejected", "Rejected"]] };

// What each list shows. Every figure comes from the server, counted from the records.
const CONFIG = {
  schools: {
    title: "Schools", noun: "schools", search: "School name or district…", filters: [ACCOUNT_FILTER], activityBy: "actorId",
    columns: [
      { key: "name", label: "School", render: (r) => <span><span className="block font-medium text-slate-900">{r.name}</span><span className="text-xs text-slate-500">{place(r.district, r.state)}</span></span> },
      { key: "status", label: "Account", render: (r) => <StatusBadge status={r.accountStatus} /> },
      { key: "projects", label: "Projects", className: "whitespace-nowrap text-slate-600", render: (r) => `${r.projects.total} (${r.projects.approved} approved)` },
      { key: "raised", label: "Raised", className: "whitespace-nowrap tabular-nums", render: (r) => formatINR(r.raised) },
      { key: "check", label: "Payments to check", className: "tabular-nums", render: (r) => (r.paymentsToCheck ? <Badge tone="warning">{r.paymentsToCheck}</Badge> : "0") },
      { key: "joined", label: "Registered", className: "whitespace-nowrap text-slate-600", render: (r) => formatDate(r.registeredAt) },
    ],
    facts: (r) => [
      ["Account", <StatusBadge key="s" status={r.accountStatus} />], ["Place", place(r.district, r.state)], ["Registered", formatDateTime(r.registeredAt)], ["Decision", formatDateTime(r.decidedAt)],
      ["Projects", `${r.projects.total}: ${r.projects.approved} approved, ${r.projects.pendingReview} waiting, ${r.projects.rejected} rejected`],
      ["Approved budgets", formatINR(r.approvedBudget)], ["Raised", formatINR(r.raised)], ["NGO payments to check", formatNumber(r.paymentsToCheck)],
      ["Payment QR", r.qrStatus ? <StatusBadge key="q" status={r.qrStatus} /> : "None"], ["Map location", r.hasMapLocation ? "Added" : "Not added"], ["Active alumni", formatNumber(r.activeAlumni)],
    ],
  },
  ngos: {
    title: "NGOs", noun: "NGOs", search: "NGO name or district…", filters: [ACCOUNT_FILTER], activityBy: "actorId",
    columns: [
      { key: "name", label: "NGO", render: (r) => <span><span className="block font-medium text-slate-900">{r.name}</span><span className="text-xs text-slate-500">{place(r.district, r.state)}</span></span> },
      { key: "status", label: "Account", render: (r) => <StatusBadge status={r.accountStatus} /> },
      { key: "committed", label: "Promised", className: "whitespace-nowrap tabular-nums", render: (r) => `${formatINR(r.commitments.amount)} (${r.commitments.parts} parts)` },
      { key: "received", label: "Received by schools", className: "whitespace-nowrap tabular-nums", render: (r) => formatINR(r.commitments.received) },
      { key: "flags", label: "Flags", render: (r) => <span className="flex flex-wrap gap-1">{r.payments.rejected.count ? <Badge tone="warning">{r.payments.rejected.count} rejected</Badge> : null}{r.payments.refundDue.count ? <Badge tone="danger">{r.payments.refundDue.count} refund due</Badge> : null}{!r.payments.rejected.count && !r.payments.refundDue.count ? "—" : null}</span> },
      { key: "joined", label: "Registered", className: "whitespace-nowrap text-slate-600", render: (r) => formatDate(r.registeredAt) },
    ],
    facts: (r) => [
      ["Account", <StatusBadge key="s" status={r.accountStatus} />], ["Place", place(r.district, r.state)], ["Registered", formatDateTime(r.registeredAt)], ["Decision", formatDateTime(r.decidedAt)],
      ["Commitments", `${r.commitments.parts} parts on ${r.commitments.projects} projects: ${formatINR(r.commitments.amount)}`], ["Received by schools", formatINR(r.commitments.received)],
      ["Payments waiting for schools", `${r.payments.waitingForSchool.count} · ${formatINR(r.payments.waitingForSchool.amount)}`], ["Payments accepted", `${r.payments.accepted.count} · ${formatINR(r.payments.accepted.amount)}`],
      ["Payments rejected", formatNumber(r.payments.rejected.count)], ["Online payments to refund", `${r.payments.refundDue.count} · ${formatINR(r.payments.refundDue.amount)}`],
      ["Online payments started, not paid", formatNumber(r.payments.unpaidOnlineOrders)], ["Volunteers", formatNumber(r.volunteers)],
    ],
  },
  donors: {
    title: "Donors", noun: "donors", search: "Donor name…", filters: [ACCOUNT_FILTER], activityBy: "actorId",
    columns: [
      { key: "name", label: "Donor", render: (r) => <span><span className="block font-medium text-slate-900">{r.name}</span><span className="text-xs text-slate-500">{place(r.city, r.state)}</span></span> },
      { key: "status", label: "Account", render: (r) => <StatusBadge status={r.accountStatus} /> },
      { key: "verified", label: "Verified donations", className: "whitespace-nowrap tabular-nums", render: (r) => `${r.donations.verified} · ${formatINR(r.donations.verifiedAmount)}` },
      { key: "notCompleted", label: "Not completed", className: "tabular-nums", render: (r) => formatNumber(r.donations.notCompleted) },
      { key: "last", label: "Last donation", className: "whitespace-nowrap text-slate-600", render: (r) => formatDate(r.donations.lastVerifiedAt) },
    ],
    facts: (r) => [
      ["Account", <StatusBadge key="s" status={r.accountStatus} />], ["Place", place(r.city, r.state)], ["Registered", formatDateTime(r.registeredAt)], ["Decision", formatDateTime(r.decidedAt)],
      ["Verified donations", `${r.donations.verified} · ${formatINR(r.donations.verifiedAmount)}`], ["Of which test mode", formatNumber(r.donations.testMode)],
      ["Started, not completed", formatNumber(r.donations.notCompleted)], ["Last verified donation", formatDateTime(r.donations.lastVerifiedAt)],
    ],
  },
  projects: {
    title: "Projects", noun: "projects", search: "Project title or school…", activityBy: "targetId",
    filters: [
      { name: "review", label: "Review", options: [["", "Any review state"], ["PENDING_REVIEW", "Waiting for review"], ["OPEN", "Approved"], ["REJECTED", "Rejected"]] },
      { name: "status", label: "Work status", options: [["", "Any work status"], ["Open", "Open"], ["In Progress", "In progress"], ["On Hold", "On hold"], ["Completed", "Completed"]] },
    ],
    columns: [
      { key: "title", label: "Project", render: (r) => <span><span className="block font-medium text-slate-900">{r.title}</span><span className="text-xs text-slate-500">{r.school.name}</span></span> },
      { key: "review", label: "Review", render: (r) => <StatusBadge status={r.reviewStatus} /> },
      { key: "budget", label: "Budget", className: "whitespace-nowrap tabular-nums", render: (r) => formatINR(r.budget) },
      { key: "raised", label: "Raised", className: "whitespace-nowrap tabular-nums", render: (r) => formatINR(r.raised) },
      { key: "check", label: "Records", render: (r) => (r.consistent ? <Badge tone="success">Match</Badge> : <Badge tone="danger">Mismatch</Badge>) },
      { key: "submitted", label: "Submitted", className: "whitespace-nowrap text-slate-600", render: (r) => formatDate(r.submittedAt) },
    ],
    facts: (r) => [
      ["School", place(r.school.name, r.school.district)], ["Category", r.category], ["Priority", r.priority], ["Review", <StatusBadge key="r" status={r.reviewStatus} />],
      ["Work status", r.status], ["Submitted", formatDateTime(r.submittedAt)], ["Reviewed", formatDateTime(r.reviewedAt)], ["Budget", formatINR(r.budget)],
      ["Raised", formatINR(r.raised)], ["Promised by NGOs", `${formatINR(r.committed)} (${r.partsTaken} of 5 parts, ${r.partsReceived} received)`],
      ["Accepted NGO payments", formatINR(r.confirmed.ngoPayments)], ["Verified donations counted", formatINR(r.confirmed.donations)],
      ["Verified donations not yet counted", formatINR(r.confirmed.verifiedDonationsNotCounted)],
      ["Raised matches the records", r.consistent ? "Yes" : <span key="m" className="font-semibold text-red-700">No: raised should be {formatINR(r.confirmed.ngoPayments + r.confirmed.donations)}</span>],
    ],
  },
};

/** A record's own recent activity (what the account did, or what happened to the project). */
const RecentActivity = ({ by, id }) => {
  const { data, error, loading } = useMonitorData("activity", { [by]: id, limit: 10 });
  if (loading) return <p className="text-sm text-slate-500" role="status">Loading activity…</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!data.items.length) return <p className="text-sm text-slate-500">No recorded activity yet.</p>;
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
      {data.items.map((e) => (
        <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
          <span>
            <span className="font-medium text-slate-900">{e.label}</span>
            <span className="text-slate-500"> · {e.target.label || e.actor.name}</span>
          </span>
          <span className="flex items-center gap-2 text-xs text-slate-500">
            {e.result !== "success" && <StatusBadge status={e.result} />}
            {formatDateTime(e.at)}
          </span>
        </li>
      ))}
    </ul>
  );
};

const RecordsSection = ({ kind }) => {
  const config = CONFIG[kind];
  const emptyFilters = Object.fromEntries((config.filters || []).map((f) => [f.name, ""]));
  const [draft, setDraft] = useState({ q: "", ...emptyFilters });
  const [filters, setFilters] = useState({ q: "", ...emptyFilters });
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const list = useMonitorData(kind, { ...filters, page, limit: 20 });

  const apply = (event) => {
    event.preventDefault();
    setFilters(draft);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <Freshness {...list} hasData={Boolean(list.data)} />
      <Card padded>
        <form onSubmit={apply} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" aria-label={`Filter ${config.noun}`}>
          <label className="min-w-0 flex-1 sm:min-w-[16rem]">
            <span className="mb-1 block text-xs font-medium text-slate-600">Search</span>
            <span className="relative block">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input value={draft.q} onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))} maxLength={80} placeholder={config.search} className="pl-9" />
            </span>
          </label>
          {(config.filters || []).map((f) => (
            <label key={f.name} className="sm:w-48">
              <span className="mb-1 block text-xs font-medium text-slate-600">{f.label}</span>
              <Select value={draft[f.name]} onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))}>
                {f.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </label>
          ))}
          <div className="flex gap-2">
            <Button type="submit">Apply</Button>
            <Button variant="ghost" onClick={() => { setDraft({ q: "", ...emptyFilters }); setFilters({ q: "", ...emptyFilters }); setPage(1); }}>Reset</Button>
          </div>
        </form>
      </Card>

      {list.error && !list.data && (
        <Alert tone="danger" title={`${config.title} couldn't be loaded`}>
          {list.error} <button type="button" onClick={list.refresh} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      <Card className="overflow-hidden">
        {list.loading && <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">Loading {config.noun}…</p>}
        {list.data && list.data.items.length === 0 && <EmptyState title={`No ${config.noun} match`} description="Try another search or filter." />}
        {list.data && list.data.items.length > 0 && (
          <DataTable caption={config.title} rows={list.data.items} columns={config.columns} onView={setViewing} viewLabel={(r) => `View ${r.name || r.title}`} />
        )}
        <Pager data={list.data} page={page} onPage={setPage} noun={config.noun} />
      </Card>

      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={viewing.name || viewing.title} description={kind === "projects" ? viewing.school.name : undefined} size="lg">
          <div className="space-y-6">
            {kind !== "projects" && <RoleBadge role={kind === "schools" ? "school" : kind === "ngos" ? "ngo" : "donor"} />}
            <Facts items={config.facts(viewing)} />
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{config.activityBy === "actorId" ? "Recent activity by this account" : "Recent activity on this project"}</p>
              <RecentActivity by={config.activityBy} id={viewing.id} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecordsSection;
