import { Link } from "react-router-dom";
import { LuBell } from "react-icons/lu";
import Alert from "../../ui/Alert";
import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import PageHeader from "../../ui/PageHeader";

const DOTS = { success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-red-500", info: "bg-primary-500" };
const formatWhen = (value) => new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/**
 * What has happened on the account, newest first. Only real events are shown: each item is built by
 * the portal from its own records ({ id, at, tone, title, text, detail?, to? }). Nothing is stored
 * as read or unread.
 */
const NotificationsView = ({ description, items, loading, error, onRetry, emptyText }) => {
  const sorted = [...items].filter((n) => n.at).sort((a, b) => new Date(b.at) - new Date(a.at));
  return (
    <>
      <PageHeader title="Notifications" description={description} />
      {error && (
        <Alert tone="danger">
          {error} <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}
      <Card className="overflow-hidden">
        {loading ? (
          <p className="px-5 py-4 text-sm text-slate-500" role="status">Loading…</p>
        ) : sorted.length === 0 ? (
          !error && <EmptyState icon={LuBell} title="No notifications yet" description={emptyText} />
        ) : (
          <ul className="divide-y divide-surface-divider">
            {sorted.map((n) => {
              const body = (
                <>
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOTS[n.tone] || DOTS.info}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      <time dateTime={new Date(n.at).toISOString()} className="text-xs text-slate-500">{formatWhen(n.at)}</time>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{n.text}</p>
                    {n.detail && <p className={`mt-1 text-sm ${n.tone === "danger" ? "text-red-700" : "text-slate-700"}`}>{n.detail}</p>}
                  </div>
                </>
              );
              return (
                <li key={n.id}>
                  {n.to ? (
                    <Link to={n.to} className="flex gap-3 px-5 py-4 transition-colors hover:bg-surface-muted focus-visible:outline-offset-[-2px]">{body}</Link>
                  ) : (
                    <div className="flex gap-3 px-5 py-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
};

export default NotificationsView;
