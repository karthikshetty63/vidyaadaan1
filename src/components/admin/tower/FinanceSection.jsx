import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import Alert from "../../ui/Alert";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import { Input, Select } from "../../ui/FormField";
import Modal from "../../ui/Modal";
import SegmentedControl from "../../ui/SegmentedControl";
import useMonitorData from "../../../hooks/useMonitorData";
import { formatDate, formatDateTime, formatINR } from "./format";
import { DataTable, Facts, Freshness, Pager, StatusBadge } from "./shared";

// NGO payments and donor donations are different things and are never mixed: an NGO payment counts once
// the school accepts it (or Razorpay verifies an online one); a donation once its signature is verified.
const KINDS = {
  "ngo-payments": {
    noun: "NGO payments",
    statuses: [["", "Any status"], ["SUBMITTED", "Waiting for school"], ["ACCEPTED", "Accepted"], ["REJECTED", "Rejected"], ["CREATED", "Online, started not paid"], ["REFUND_DUE", "Online, refund due"]],
    extra: { name: "channel", label: "Channel", options: [["", "Direct and online"], ["DIRECT", "Direct to school"], ["ONLINE", "Online (Razorpay)"]] },
    columns: [
      { key: "when", label: "Recorded", className: "whitespace-nowrap text-slate-600", render: (r) => formatDateTime(r.submittedAt) },
      { key: "ngo", label: "NGO → school", render: (r) => <span><span className="block font-medium text-slate-900">{r.ngo.name}</span><span className="text-xs text-slate-500">to {r.school.name}</span></span> },
      { key: "project", label: "Project", render: (r) => <span className="text-slate-600">{r.project.title || "—"}</span> },
      { key: "amount", label: "Amount", className: "whitespace-nowrap tabular-nums font-semibold", render: (r) => formatINR(r.amount) },
      { key: "channel", label: "Channel", render: (r) => <Badge tone="neutral">{r.channel === "ONLINE" ? "Online" : "Direct"}</Badge> },
      { key: "status", label: "Status", render: (r) => <span className="flex flex-col items-start gap-1"><StatusBadge status={r.status} />{r.counted ? <span className="text-xs text-emerald-700">Counts as raised</span> : null}</span> },
    ],
    facts: (r) => [
      ["NGO", r.ngo.name], ["School", r.school.name], ["Project", r.project.title], ["Parts", r.parts.join(", ")], ["Amount", formatINR(r.amount)],
      ["Channel", r.channel === "ONLINE" ? "Online (Razorpay)" : "Direct to the school"], ["Method", r.method], ["Status", <StatusBadge key="s" status={r.status} />],
      ["Counts as raised", r.counted ? "Yes" : "No"], ["Reference", r.reference || "—"], ["Razorpay order", r.orderId], ["Razorpay payment", r.razorpayPaymentId],
      ["Razorpay mode", r.mode], ["Proof uploaded", r.channel === "ONLINE" ? "Not needed (online)" : r.hasProof ? "Yes" : "No"],
      ["Paid on (as recorded)", formatDate(r.paidOn)], ["Recorded", formatDateTime(r.submittedAt)], ["Decided", formatDateTime(r.reviewedAt)], ["Rejection reason", r.rejectionReason],
    ],
  },
  donations: {
    noun: "donations",
    statuses: [["", "Any status"], ["PAID", "Verified"], ["CREATED", "Started, not completed"]],
    extra: { name: "mode", label: "Razorpay mode", options: [["", "Test and live"], ["test", "Test mode"], ["live", "Live"]] },
    columns: [
      { key: "when", label: "Started", className: "whitespace-nowrap text-slate-600", render: (r) => formatDateTime(r.createdAt) },
      { key: "donor", label: "Donor", render: (r) => <span className="font-medium text-slate-900">{r.donor.name}</span> },
      { key: "project", label: "Project", render: (r) => <span><span className="block text-slate-700">{r.project.title || "—"}</span><span className="text-xs text-slate-500">{r.school.name}</span></span> },
      { key: "amount", label: "Amount", className: "whitespace-nowrap tabular-nums font-semibold", render: (r) => formatINR(r.amount) },
      { key: "status", label: "Status", render: (r) => <span className="flex flex-col items-start gap-1"><StatusBadge status={r.status} />{r.mode === "test" ? <span className="text-xs text-slate-500">Test mode</span> : null}</span> },
      { key: "counted", label: "In raised", render: (r) => (r.countedInRaised ? <Badge tone="success">Counted</Badge> : r.status === "PAID" ? <Badge tone="danger">Not counted</Badge> : "—") },
    ],
    facts: (r) => [
      ["Donor", r.donor.name], ["Project", r.project.title], ["School", r.school.name], ["Amount", formatINR(r.amount)], ["Status", <StatusBadge key="s" status={r.status} />],
      ["Razorpay mode", r.mode === "test" ? "Test (no real money)" : "Live"], ["Counted in raised", r.countedInRaised ? "Yes" : "No"], ["Razorpay order", r.orderId],
      ["Razorpay payment", r.paymentId], ["Started", formatDateTime(r.createdAt)], ["Verified", formatDateTime(r.verifiedAt)],
    ],
  },
};

const FinanceList = ({ kind, initialStatus }) => {
  const config = KINDS[kind];
  const empty = { q: "", status: initialStatus || "", [config.extra.name]: "", from: "", to: "" };
  const [draft, setDraft] = useState(empty);
  const [filters, setFilters] = useState(empty);
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const list = useMonitorData(kind, { ...filters, page, limit: 20 });
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="space-y-5">
      <Freshness {...list} hasData={Boolean(list.data)} />
      <Card padded>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilters(draft);
            setPage(1);
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
          aria-label={`Filter ${config.noun}`}
        >
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">Search</span>
            <span className="relative block">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input value={draft.q} onChange={set("q")} maxLength={80} placeholder={kind === "donations" ? "Donor, project or Razorpay ID…" : "NGO, school or project…"} className="pl-9" />
            </span>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">Status</span>
            <Select value={draft.status} onChange={set("status")}>
              {config.statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">{config.extra.label}</span>
            <Select value={draft[config.extra.name]} onChange={set(config.extra.name)}>
              {config.extra.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">From</span>
            <Input type="date" value={draft.from} onChange={set("from")} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">To</span>
            <Input type="date" value={draft.to} onChange={set("to")} />
          </label>
          <div className="flex gap-2 lg:col-span-6">
            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" onClick={() => { const clear = { ...empty, status: "" }; setDraft(clear); setFilters(clear); setPage(1); }}>Reset</Button>
          </div>
        </form>
      </Card>

      {list.error && !list.data && (
        <Alert tone="danger" title="These payments couldn't be loaded">
          {list.error} <button type="button" onClick={list.refresh} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}
      <Card className="overflow-hidden">
        {list.loading && <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">Loading {config.noun}…</p>}
        {list.data && list.data.items.length === 0 && <EmptyState title={`No ${config.noun} match`} description="Try other filters or dates." />}
        {list.data && list.data.items.length > 0 && (
          <DataTable caption={config.noun} rows={list.data.items} columns={config.columns} onView={setViewing} viewLabel={(r) => `View ${formatINR(r.amount)} from ${r.ngo?.name || r.donor?.name}`} />
        )}
        <Pager data={list.data} page={page} onPage={setPage} noun={config.noun} />
      </Card>

      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={`${formatINR(viewing.amount)} · ${kind === "donations" ? "Donation" : "NGO payment"}`} description={viewing.project.title || undefined} size="lg">
          <Facts items={config.facts(viewing)} />
        </Modal>
      )}
    </div>
  );
};

const FinanceSection = ({ initialStatus }) => {
  const [kind, setKind] = useState("ngo-payments");
  return (
    <div className="space-y-5">
      <SegmentedControl
        label="Kind of transaction"
        value={kind}
        onChange={setKind}
        options={[{ value: "ngo-payments", label: "NGO payments" }, { value: "donations", label: "Donor donations" }]}
      />
      {/* Keyed so each list keeps its own filters. */}
      <FinanceList key={kind} kind={kind} initialStatus={kind === "ngo-payments" ? initialStatus : ""} />
    </div>
  );
};

export default FinanceSection;
