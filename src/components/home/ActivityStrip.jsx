import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuBadgeCheck, LuCircleCheck, LuHandCoins, LuHeart } from "react-icons/lu";
import { getPublicActivity } from "../../api/public";
import { BAND, CONTAINER, EYEBROW, H2, LEAD, SECTION_SPACING } from "./styles";

const REFRESH_MS = 60 * 1000;
const SHOWN = 6;

// How each kind of public event reads, with its icon. The server sends no names and no amounts, only what
// happened, which approved need it was and the school's district.
const KINDS = {
  need_approved: { icon: LuBadgeCheck, tone: "bg-slate-100 text-brand-navy", text: () => "New need approved:" },
  ngo_committed: {
    icon: LuHandCoins,
    tone: "bg-amber-50 text-amber-700",
    text: (e) => `An NGO committed to ${e.parts === 1 ? "1 part" : `${e.parts} parts`} of`,
  },
  school_received: { icon: LuCircleCheck, tone: "bg-emerald-50 text-emerald-700", text: () => "A school received NGO funding for" },
  donor_supported: { icon: LuHeart, tone: "bg-emerald-50 text-emerald-700", text: () => "A donor supported" },
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
    <section id="activity" aria-labelledby="activity-heading" className={`${BAND} scroll-mt-16`}>
      <div className={`${CONTAINER} ${SECTION_SPACING}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={EYEBROW}>Activity</p>
            <h2 id="activity-heading" className={`mt-2 ${H2}`}>Recent activity</h2>
            <p className={LEAD}>The latest recorded events on approved needs. No names or amounts are shown.</p>
          </div>
          <p className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /> Refreshes every minute
          </p>
        </div>

        <ol className="mt-8 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {shown.map((e) => {
            const { icon: Icon, tone, text } = KINDS[e.kind];
            return (
              <li key={e.id} className="flex gap-4 px-4 py-4 sm:px-5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`} aria-hidden="true">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <p className="text-[15px] leading-6 text-slate-700">
                    {text(e)}{" "}
                    <Link to={`/projects/${e.project.id}`} className="font-semibold text-brand-navy underline-offset-2 hover:underline">
                      {e.project.title}
                    </Link>
                    {e.place && <span className="text-slate-500"> · {e.place}</span>}
                  </p>
                  <time dateTime={e.at} className="mt-0.5 block shrink-0 text-sm tabular-nums text-slate-500 sm:mt-0">
                    {formatDay(e.at)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default ActivityStrip;
