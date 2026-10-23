import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicActivity } from "../../api/public";

const REFRESH_MS = 60 * 1000;
const SHOWN = 6;

// How each kind of public event reads. The server sends no names and no amounts, only what happened,
// which approved need it was and the school's district.
const KINDS = {
  need_approved: () => "New need approved:",
  ngo_committed: (e) => `An NGO committed to ${e.parts === 1 ? "1 part" : `${e.parts} parts`} of`,
  school_received: () => "A school received NGO funding for",
  donor_supported: () => "A donor supported",
};

const formatDay = (at) => new Date(at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * "Recent activity": the latest real events about approved needs, each with its date, refreshed every minute
 * while the page is open. Hidden when there's nothing to show (never a made-up example).
 */
const ActivityStrip = () => {
  const [items, setItems] = useState([]);

  const load = useCallback(() => getPublicActivity().then((data) => setItems(data.items || []), () => {}), []);
  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState !== "hidden" && load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const shown = items.filter((e) => KINDS[e.kind]).slice(0, SHOWN);
  if (!shown.length) return null;
  return (
    <section aria-labelledby="activity-heading" className="mt-14 border-t border-slate-200 pt-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="activity-heading" className="font-heading text-lg font-bold text-brand-navy">Recent activity</h2>
        <p className="text-sm text-slate-500">The latest recorded events on approved needs. No names or amounts are shown.</p>
      </div>
      <ol className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
        {shown.map((e) => (
          <li key={e.id} className="grid gap-1 py-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-6">
            <time dateTime={e.at} className="text-sm tabular-nums text-slate-500">{formatDay(e.at)}</time>
            <p className="text-sm text-slate-700">
              {KINDS[e.kind](e)}{" "}
              <Link to={`/projects/${e.project.id}`} className="font-semibold text-brand-navy underline-offset-2 hover:text-brand-navy hover:underline">
                {e.project.title}
              </Link>
              {e.place && <span className="text-slate-500"> · {e.place}</span>}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default ActivityStrip;
