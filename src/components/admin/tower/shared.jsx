import { LuChevronLeft, LuChevronRight, LuCircleAlert, LuClock, LuPause, LuRefreshCw } from "react-icons/lu";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import { REFRESH_SECONDS } from "../../../hooks/useMonitorData";
import { ROLE_LABELS, formatNumber, formatTime } from "./format";

// Small pieces shared by the Control Tower's sections.

const ROLE_TONES = { school: "info", ngo: "success", donor: "warning", admin: "neutral", visitor: "neutral", system: "neutral" };
export const RoleBadge = ({ role }) => <Badge tone={ROLE_TONES[role] || "neutral"}>{ROLE_LABELS[role] || role || "—"}</Badge>;

const STATUS = {
  active: ["success", "Active"], pending: ["warning", "Pending"], rejected: ["danger", "Rejected"],
  OPEN: ["success", "Approved"], PENDING_REVIEW: ["warning", "Waiting for review"], REJECTED: ["danger", "Rejected"],
  SUBMITTED: ["warning", "Waiting for school"], ACCEPTED: ["success", "Accepted"], CREATED: ["neutral", "Started, not paid"],
  REFUND_DUE: ["danger", "Refund due"], PAID: ["success", "Verified"],
  success: ["success", "Success"], failure: ["danger", "Failed"], info: ["neutral", "Info"],
  ACTIVE: ["success", "Active"], PENDING: ["warning", "Waiting for review"],
};
export const StatusBadge = ({ status }) => {
  const [tone, label] = STATUS[status] || ["neutral", status || "—"];
  return <Badge tone={tone}>{label}</Badge>;
};

const SOURCES = { live: ["info", "Live log"], records: ["neutral", "From records"], system: ["neutral", "System"] };
export const SourceBadge = ({ source }) => {
  const [tone, label] = SOURCES[source] || ["neutral", source];
  return <Badge tone={tone}>{label}</Badge>;
};

/**
 * When the figures were fetched and how they refresh. Honest about being periodic, about pauses in a
 * background tab, and about failed refreshes (the last good data stays on screen).
 */
export const Freshness = ({ updatedAt, stale, error, visible, refreshing, refresh, hasData }) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500" aria-live="polite">
      {visible ? <LuClock className="h-3.5 w-3.5" aria-hidden="true" /> : <LuPause className="h-3.5 w-3.5" aria-hidden="true" />}
      {updatedAt ? <span>Last updated <span className="font-semibold text-slate-700">{formatTime(updatedAt)}</span></span> : <span>Not loaded yet</span>}
      <span aria-hidden="true">·</span>
      <span>{visible ? `Refreshes every ${REFRESH_SECONDS} seconds while this page is open (not instant)` : "Refreshing is paused while this tab is in the background"}</span>
    </p>
    <Button size="sm" variant="secondary" icon={LuRefreshCw} onClick={refresh} loading={refreshing}>
      Refresh now
    </Button>
    {(error && hasData) || stale ? (
      <p role="status" className="flex w-full items-start gap-2 rounded-control border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:order-last">
        <LuCircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {error ? `Couldn't refresh (${error}). ` : ""}
        These figures may be out of date{updatedAt ? `: they're from ${formatTime(updatedAt)}` : ""}.
      </p>
    ) : null}
  </div>
);

/** Previous / next page with "Page 2 of 5 · 93 results". */
export const Pager = ({ data, page, onPage, noun = "results" }) =>
  data && data.total > 0 ? (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
      <span>
        Page {data.page} of {data.pages} · {formatNumber(data.total)} {noun}
      </span>
      <span className="flex gap-2">
        <Button size="sm" variant="secondary" icon={LuChevronLeft} onClick={() => onPage(page - 1)} disabled={page <= 1}>Previous</Button>
        <Button size="sm" variant="secondary" icon={LuChevronRight} iconPosition="right" onClick={() => onPage(page + 1)} disabled={!data.hasMore}>Next</Button>
      </span>
    </nav>
  ) : null;

/**
 * A table of monitoring rows. `columns`: [{ key, label, render(row), className? }]. Each row has a
 * "View" button for its details (keyboard users) and the whole row can be clicked.
 */
export const DataTable = ({ caption, columns, rows, onView, viewLabel }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 text-left">
          {columns.map((c) => (
            <th key={c.key} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-slate-500 first:pl-5">{c.label}</th>
          ))}
          {onView && <th scope="col" className="px-4 py-2.5"><span className="sr-only">Details</span></th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr key={row.id} className={onView ? "cursor-pointer transition-colors hover:bg-slate-50" : ""} onClick={onView ? () => onView(row) : undefined}>
            {columns.map((c) => (
              <td key={c.key} className={`px-4 py-3 align-top first:pl-5 ${c.className || ""}`}>{c.render(row)}</td>
            ))}
            {onView && (
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                  }}
                  aria-label={viewLabel(row)}
                >
                  View
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Read-only facts in a detail view. `items`: [label, value] (empty values show "—"). */
export const Facts = ({ items }) => (
  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <div key={label} className="min-w-0">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-slate-900">{value === null || value === undefined || value === "" ? "—" : value}</dd>
      </div>
    ))}
  </dl>
);
