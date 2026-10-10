import { Link } from "react-router-dom";
import { LuArrowRight, LuBell, LuCircleCheck } from "react-icons/lu";
import useNotifications from "../../../hooks/useNotifications";
import Alert from "../../ui/Alert";
import Badge from "../../ui/Badge";
import Card, { CardHeader } from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import PageHeader from "../../ui/PageHeader";
import { buttonClasses } from "../../ui/classes";

const DOTS = { success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-red-500", info: "bg-primary-500" };
const formatWhen = (value) => new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** The title, when it happened, the sentence and (for a reason or a note) the detail. */
const ItemText = ({ item, fresh, since = false }) => (
  <div className="min-w-0 flex-1">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
        {item.title}
        {fresh && <Badge tone="info">New</Badge>}
      </p>
      {item.at && (
        <time dateTime={new Date(item.at).toISOString()} className="text-xs text-slate-500">
          {since ? `Since ${formatWhen(item.at)}` : formatWhen(item.at)}
        </time>
      )}
    </div>
    <p className="mt-0.5 text-sm text-slate-600">{item.text}</p>
    {item.detail && <p className={`mt-1 text-sm ${item.tone === "danger" ? "text-red-700" : "text-slate-700"}`}>{item.detail}</p>}
  </div>
);

const Dot = ({ tone }) => <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOTS[tone] || DOTS.info}`} aria-hidden="true" />;

/**
 * The account's notifications, from the server (see useNotifications): first what is waiting for this
 * account, each with a button to the page where it is handled, then what has happened, newest first.
 * Opening this view clears the number on the bell.
 * @param {boolean} [canHaveActions] false for donors, who never have anything waiting.
 */
const NotificationsView = ({ description, emptyText, canHaveActions = true }) => {
  const { actions, news, isNew, loading, error, reload } = useNotifications();
  const nothingAtAll = !loading && !error && actions.length === 0 && news.length === 0;

  return (
    <>
      <PageHeader title="Notifications" description={description} />
      {error && (
        <Alert tone="danger">
          {error} <button type="button" onClick={reload} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      {loading ? (
        <Card className="overflow-hidden">
          <p className="px-5 py-4 text-sm text-slate-500" role="status">Loading…</p>
        </Card>
      ) : nothingAtAll ? (
        <Card className="overflow-hidden">
          <EmptyState icon={LuBell} title="No notifications yet" description={emptyText} />
        </Card>
      ) : (
        <>
          {actions.length > 0 ? (
            <Card as="section" aria-labelledby="needs-action-heading" className="overflow-hidden border-amber-300/80">
              <div className="flex items-start justify-between gap-4 border-b border-amber-200/80 bg-amber-50/70 px-5 py-4">
                <div className="min-w-0">
                  <h2 id="needs-action-heading" className="text-[15px] font-bold tracking-tight text-slate-900">Needs your action</h2>
                  <p className="mt-0.5 text-xs text-slate-600">These stay here until you deal with them.</p>
                </div>
                <Badge tone="warning">{actions.length} waiting</Badge>
              </div>
              <ul className="divide-y divide-surface-divider">
                {actions.map((item) => (
                  <li key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <Dot tone={item.tone} />
                      <ItemText item={item} fresh={isNew(item)} since />
                    </div>
                    <Link to={item.to} className={buttonClasses({ size: "sm", className: "shrink-0 self-start sm:self-center" })}>
                      {item.button} <LuArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            canHaveActions && !error && (
              <p className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-3 text-sm font-medium text-emerald-800">
                <LuCircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" /> Nothing needs your action right now.
              </p>
            )
          )}

          {news.length > 0 && (
            <Card as="section" aria-labelledby="updates-heading" className="overflow-hidden">
              <CardHeader title={<span id="updates-heading">Updates</span>} description="What has happened, newest first." />
              <ul className="divide-y divide-surface-divider">
                {news.map((item) => (
                  <li key={item.id}>
                    <Link to={item.to} className="flex gap-3 px-5 py-4 transition-colors hover:bg-surface-muted focus-visible:outline-offset-[-2px]">
                      <Dot tone={item.tone} />
                      <ItemText item={item} fresh={isNew(item)} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </>
  );
};

export default NotificationsView;
