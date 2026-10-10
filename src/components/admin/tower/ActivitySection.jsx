import { useState } from "react";
import { LuActivity, LuSearch } from "react-icons/lu";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import { Input, Select } from "../../ui/FormField";
import Modal from "../../ui/Modal";
import useMonitorData from "../../../hooks/useMonitorData";
import { ACTIVITY_CATEGORIES } from "../../../../shared/activityRules.js";
import { ROLE_LABELS, formatDateTime, formatINR } from "./format";
import { DataTable, Facts, Freshness, Pager, RoleBadge, SourceBadge, StatusBadge } from "./shared";

const EMPTY = { q: "", role: "", category: "", result: "", source: "", from: "", to: "" };
const DETAIL_LABELS = {
  amount: "Amount", parts: "Parts", reason: "Reason", method: "Method", reference: "Reference", channel: "Channel", mode: "Razorpay mode",
  projectTitle: "Project", school: "School", ngo: "NGO", role: "Account type", previousStatus: "Previous status", portal: "Sign-in page",
  status: "Status", budget: "Budget", category: "Category", priority: "Priority", fields: "Fields changed", upiId: "UPI ID",
  matchesVerifiedUpi: "Matches the verified UPI ID", alumniEmails: "Alumni emails", alumniQueued: "Alumni emails queued", paymentId: "Razorpay payment ID",
  remember: "Remember me", source: "Set from", reviewStatus: "Review status", imported: "Events imported",
};
// Ids are shown as names (school, ngo) by the server; the raw ids add nothing here.
const HIDDEN_DETAILS = ["projectId", "schoolId", "ngoId"];
const showValue = (key, value) =>
  Array.isArray(value) ? value.join(", ") : key === "amount" || key === "budget" ? formatINR(value) : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);

/** One event in full. Actions here only change the filters; nothing is changed on the server. */
const EventDetail = ({ eventId, onClose, onFilter }) => {
  const { data, error, loading } = useMonitorData(`activity/${eventId}`);
  const e = data?.event;
  return (
    <Modal open onClose={onClose} title={e ? e.label : "Activity"} description={e ? formatDateTime(e.at) : undefined} icon={LuActivity} size="lg"
      footer={
        e && (
          <>
            {e.actor.id && <Button variant="secondary" onClick={() => onFilter({ actorId: e.actor.id, label: `by ${e.actor.name || "this account"}` })}>Everything by {e.actor.name || "this account"}</Button>}
            {e.target.id && <Button variant="secondary" onClick={() => onFilter({ targetId: e.target.id, label: `on ${e.target.label || "this record"}` })}>Everything on this record</Button>}
          </>
        )
      }
    >
      {loading && <p className="text-sm text-slate-500" role="status">Loading…</p>}
      {error && <Alert tone="danger">{error}</Alert>}
      {e && (
        <div className="space-y-5">
          <Facts
            items={[
              ["Who", <span key="who" className="inline-flex flex-wrap items-center gap-2">{e.actor.name || "—"} <RoleBadge role={e.actor.role} /></span>],
              ["Result", <StatusBadge key="r" status={e.result} />],
              ["Record", e.target.label || "—"],
              ["Record type", e.target.type || "—"],
              ["Category", ACTIVITY_CATEGORIES[e.category] || e.category],
              ["Source", <SourceBadge key="s" source={e.source} />],
            ]}
          />
          {Object.keys(e.details).filter((k) => !HIDDEN_DETAILS.includes(k)).length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Details</p>
              <Facts items={Object.entries(e.details).filter(([k]) => !HIDDEN_DETAILS.includes(k)).map(([k, v]) => [DETAIL_LABELS[k] || k, showValue(k, v)])} />
            </div>
          )}
          {e.source === "records" && (
            <Alert tone="neutral">Rebuilt from the records when the activity log started: it shows the record&rsquo;s latest state, not every change.</Alert>
          )}
        </div>
      )}
    </Modal>
  );
};

const ActivitySection = () => {
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [scope, setScope] = useState(null); // { actorId | targetId, label } from a detail view
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const params = { ...filters, ...(scope ? { actorId: scope.actorId, targetId: scope.targetId } : {}), page, limit: 25 };
  const feed = useMonitorData("activity", params);

  const apply = (event) => {
    event.preventDefault();
    setFilters(draft);
    setPage(1);
  };
  const reset = () => {
    setDraft(EMPTY);
    setFilters(EMPTY);
    setScope(null);
    setPage(1);
  };
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="space-y-5">
      <Freshness {...feed} hasData={Boolean(feed.data)} />

      <Card padded>
        <form onSubmit={apply} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter activity">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-600">Search</span>
            <span className="relative block">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input value={draft.q} onChange={set("q")} maxLength={80} placeholder="Name, project or record…" className="pl-9" />
            </span>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">Who</span>
            <Select value={draft.role} onChange={set("role")}>
              <option value="">Everyone</option>
              {["school", "ngo", "donor", "admin", "visitor", "system"].map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">Category</span>
            <Select value={draft.category} onChange={set("category")}>
              <option value="">All categories</option>
              {Object.entries(ACTIVITY_CATEGORIES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">Result</span>
            <Select value={draft.result} onChange={set("result")}>
              <option value="">Any result</option>
              <option value="success">Success</option>
              <option value="failure">Failed</option>
              <option value="info">Info</option>
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">Source</span>
            <Select value={draft.source} onChange={set("source")}>
              <option value="">Live log and records</option>
              <option value="live">Live log only</option>
              <option value="records">Rebuilt from records only</option>
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
          <div className="flex items-end gap-2 lg:col-span-4">
            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" onClick={reset}>Reset</Button>
            {scope && (
              <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
                Showing activity {scope.label}
                <button type="button" onClick={() => { setScope(null); setPage(1); }} className="font-semibold underline">Clear</button>
              </span>
            )}
          </div>
        </form>
      </Card>

      {feed.error && !feed.data && (
        <Alert tone="danger" title="Activity couldn't be loaded">
          {feed.error} <button type="button" onClick={feed.refresh} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      <Card className="overflow-hidden">
        {feed.loading && <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">Loading activity…</p>}
        {feed.data && feed.data.items.length === 0 && (
          <EmptyState icon={LuActivity} title="No activity matches" description="Try other filters or a wider date range. Only recorded activity is shown; nothing is estimated." />
        )}
        {feed.data && feed.data.items.length > 0 && (
          <DataTable
            caption="Activity, newest first"
            rows={feed.data.items}
            onView={(row) => setViewing(row.id)}
            viewLabel={(row) => `View ${row.label} at ${formatDateTime(row.at)}`}
            columns={[
              { key: "at", label: "When", className: "whitespace-nowrap text-slate-600", render: (r) => formatDateTime(r.at) },
              { key: "who", label: "Who", render: (r) => <span className="flex flex-col items-start gap-1"><span className="font-medium text-slate-900">{r.actor.name || "—"}</span><RoleBadge role={r.actor.role} /></span> },
              { key: "action", label: "Action", render: (r) => <span className="font-medium text-slate-900">{r.label}</span> },
              { key: "record", label: "Record", render: (r) => <span className="text-slate-600">{r.target.label || "—"}</span> },
              { key: "result", label: "Result", render: (r) => <StatusBadge status={r.result} /> },
              { key: "source", label: "Source", render: (r) => <SourceBadge source={r.source} /> },
            ]}
          />
        )}
        <Pager data={feed.data} page={page} onPage={setPage} noun="events" />
      </Card>

      {viewing && (
        <EventDetail
          eventId={viewing}
          onClose={() => setViewing(null)}
          onFilter={(next) => {
            setScope(next);
            setPage(1);
            setViewing(null);
          }}
        />
      )}
    </div>
  );
};

export default ActivitySection;
