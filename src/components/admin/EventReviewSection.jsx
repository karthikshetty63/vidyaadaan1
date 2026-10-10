import { useEffect, useState } from "react";
import { LuCircleCheck, LuCircleX, LuClock } from "react-icons/lu";
import { eventState, formatEventDate } from "../events/eventFormat";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import FormField, { Textarea } from "../ui/FormField";
import Modal from "../ui/Modal";
import SegmentedControl from "../ui/SegmentedControl";
import StatCard from "../ui/StatCard";
import {
  EVENT_REJECTION_REASON_MAX, EVENT_REJECTION_REASON_MIN, EVENT_REVIEW_LABELS, approveEvent, getEventForReview, listEventsForReview, rejectEvent,
} from "../../api/events";

const STATUSES = ["PENDING_REVIEW", "OPEN", "REJECTED"];
const EMPTY_TITLES = { PENDING_REVIEW: "No events waiting for review", OPEN: "No approved events yet", REJECTED: "No rejected events" };
const REVIEW_TONES = { PENDING_REVIEW: "warning", OPEN: "success", REJECTED: "danger" };

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const place = (school) => [school?.district, school?.state].filter(Boolean).join(", ");

const Details = ({ rows }) => (
  <dl className="divide-y divide-slate-200 rounded-control border border-slate-200">
    {rows.map(([label, value]) => (
      <div key={label} className="grid grid-cols-1 gap-1 px-4 py-2.5 text-sm sm:grid-cols-3 sm:gap-4">
        <dt className="text-slate-500">{label}</dt>
        <dd className="whitespace-pre-line break-words font-medium text-slate-900 sm:col-span-2">{value || "—"}</dd>
      </div>
    ))}
  </dl>
);

/* ─── Review panel ─────────────────────────────────────── */
const EventReviewModal = ({ eventId, onClose, onDecision }) => {
  const [event, setEvent] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getEventForReview(eventId)
      .then((res) => !cancelled && setEvent(res.event))
      .catch((err) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const decide = async (action) => {
    if (busy) return;
    setBusy(true);
    setActionError("");
    try {
      const res = action === "approve" ? await approveEvent(eventId) : await rejectEvent(eventId, reason);
      onDecision(res.message);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const waiting = event?.reviewStatus === "PENDING_REVIEW";
  const schoolActive = event?.school?.accountStatus === "active";
  const footer = waiting && (
    <>
      {showReject ? (
        <Button variant="destructive" onClick={() => decide("reject")} disabled={reason.trim().length < EVENT_REJECTION_REASON_MIN} loading={busy}>
          {busy ? "Rejecting…" : "Confirm rejection"}
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => setShowReject(true)} disabled={busy}>Reject…</Button>
      )}
      <Button onClick={() => decide("approve")} loading={busy && !showReject} disabled={busy || !schoolActive}>Approve event</Button>
    </>
  );

  return (
    <Modal open onClose={busy ? () => {} : onClose} size="lg" title={event?.title || "Loading event…"} description="Event review" footer={footer}>
      {loadError && <Alert tone="danger">{loadError}</Alert>}
      {!event && !loadError && <p className="text-sm text-slate-500">Loading event details…</p>}

      {event && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge>{event.type}</Badge>
            <Badge tone={REVIEW_TONES[event.reviewStatus]}>{EVENT_REVIEW_LABELS[event.reviewStatus]}</Badge>
            {event.reviewStatus === "OPEN" && <Badge tone={eventState(event)[0]}>{event.status}</Badge>}
            <span>Submitted {formatDate(event.submittedAt)}</span>
            {event.reviewedAt && (
              <>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span>Reviewed {formatDate(event.reviewedAt)}</span>
              </>
            )}
          </div>

          {event.reviewStatus === "REJECTED" && event.rejectionReason && <Alert tone="danger" title="Rejection reason">{event.rejectionReason}</Alert>}
          {waiting && !schoolActive && <Alert tone="warning">This school&apos;s account is not active, so the event can&apos;t be approved.</Alert>}

          <section aria-labelledby="event-school-heading">
            <h3 id="event-school-heading" className="mb-2 text-sm font-semibold text-slate-900">School</h3>
            <Details
              rows={[
                ["School", event.school?.name],
                ["UDISE code", event.school?.udise],
                ["Location", place(event.school)],
                ["Contact", event.school ? `${event.school.contactName} · ${event.school.email}` : ""],
                ["Account", event.school ? (event.school.accountStatus === "active" ? "Approved" : event.school.accountStatus) : ""],
              ]}
            />
          </section>

          <section aria-labelledby="event-details-heading">
            <h3 id="event-details-heading" className="mb-2 text-sm font-semibold text-slate-900">Event</h3>
            <Details
              rows={[
                ["Date", formatEventDate(event.date)],
                ["Venue", event.venue],
                ["About the event", event.description],
                ["Students taking part", event.expectedStudents.toLocaleString("en-IN")],
                ["Help wanted", event.helpNeeded.join(", ")],
                ["Details of the help", event.helpDetails],
                ["Offers of help so far", String(event.offerCount)],
              ]}
            />
          </section>

          {showReject && (
            <FormField
              id="event-reject-reason"
              label="Reason for rejection"
              required
              hint={`Shown to the school so it can fix the event and resubmit. At least ${EVENT_REJECTION_REASON_MIN} characters.`}
            >
              {(f) => (
                <Textarea {...f} data-autofocus maxLength={EVENT_REJECTION_REASON_MAX} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Please say what the sponsorship would pay for." />
              )}
            </FormField>
          )}

          {actionError && <Alert tone="danger">{actionError}</Alert>}
        </div>
      )}
    </Modal>
  );
};

/* ─── Section ──────────────────────────────────────────── */
/** Admin review of school events: the same records the schools create. */
const EventReviewSection = () => {
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, events: [], counts: { PENDING_REVIEW: 0, OPEN: 0, REJECTED: 0 }, error: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState("");

  const requestKey = `${status}|${reloadCount}`;
  useEffect(() => {
    let cancelled = false;
    listEventsForReview(status)
      .then((res) => !cancelled && setResult({ key: requestKey, events: res.events, counts: res.counts, error: "" }))
      .catch((err) => !cancelled && setResult((prev) => ({ ...prev, key: requestKey, error: err.message })));
    return () => {
      cancelled = true;
    };
  }, [status, requestKey]);

  const loading = result.key !== requestKey;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Waiting for review" value={result.counts.PENDING_REVIEW} icon={LuClock} />
        <StatCard label="Approved" value={result.counts.OPEN} icon={LuCircleCheck} />
        <StatCard label="Rejected" value={result.counts.REJECTED} icon={LuCircleX} />
      </div>

      <SegmentedControl
        label="Filter events by review status"
        value={status}
        onChange={(v) => {
          setNotice("");
          setStatus(v);
        }}
        options={STATUSES.map((s) => ({ value: s, label: s === "REJECTED" ? "Rejected" : EVENT_REVIEW_LABELS[s] }))}
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {result.error && <Alert tone="danger">{result.error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">Loading events…</p>
        ) : !result.error && result.events.length === 0 ? (
          <EmptyState title={EMPTY_TITLES[status]} description="Nothing needs your attention here right now." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  {["Event", "School", "Date", "Submitted", "Status"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-5 py-2.5 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                  <th scope="col" className="px-5 py-2.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.events.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{e.title}</p>
                      <p className="text-xs text-slate-500">{e.type} · {e.expectedStudents.toLocaleString("en-IN")} students</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-900">{e.school?.name || "—"}</p>
                      <p className="text-xs text-slate-500">{place(e.school) || "—"}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatEventDate(e.date)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(e.submittedAt)}</td>
                    <td className="px-5 py-3"><Badge tone={REVIEW_TONES[e.reviewStatus]}>{e.reviewStatus === "REJECTED" ? "Rejected" : EVENT_REVIEW_LABELS[e.reviewStatus]}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedId(e.id)} aria-label={`Review ${e.title}`}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedId && (
        <EventReviewModal
          eventId={selectedId}
          onClose={() => setSelectedId(null)}
          onDecision={(message) => {
            setSelectedId(null);
            setNotice(message);
            setReloadCount((n) => n + 1);
          }}
        />
      )}
    </>
  );
};

export default EventReviewSection;
