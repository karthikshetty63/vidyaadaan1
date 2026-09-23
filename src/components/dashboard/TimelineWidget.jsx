import Card, { CardHeader } from "../ui/Card";
import EmptyState from "../ui/EmptyState";

/** Chronological activity list: { title, desc?, time } */
const TimelineWidget = ({ events = [], title = "Recent Activity" }) => (
  <Card>
    <CardHeader title={title} />
    {events.length === 0 ? (
      <EmptyState title="No recent activity" />
    ) : (
      <ol className="px-5 py-4">
        {events.map((event, i) => (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < events.length - 1 && <span className="absolute left-[5px] top-4 bottom-0 w-px bg-slate-200" aria-hidden="true" />}
            <span className="relative mt-1.5 w-[11px] h-[11px] rounded-full border-2 border-white bg-blue-600 ring-1 ring-slate-200 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">{event.title}</p>
                <time className="text-xs text-slate-500 shrink-0">{event.time}</time>
              </div>
              {event.desc && <p className="mt-0.5 text-sm text-slate-500">{event.desc}</p>}
            </div>
          </li>
        ))}
      </ol>
    )}
  </Card>
);

export default TimelineWidget;
