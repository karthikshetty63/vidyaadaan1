import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuBadgeCheck, LuHandCoins, LuHeart, LuUsers } from "react-icons/lu";
import { getPublicActivity } from "../../api/public";

const REFRESH_MS = 60 * 1000;

// How each kind of public event reads. The server sends no names and no amounts, only what happened,
// which approved need it was and the school's district.
const KINDS = {
  need_approved: { icon: LuBadgeCheck, tint: "text-blue-600", text: (e) => <>New need approved: <strong>{e.project.title}</strong></> },
  ngo_committed: { icon: LuUsers, tint: "text-emerald-600", text: (e) => <>An NGO committed to {e.parts === 1 ? "1 part" : `${e.parts} parts`} of <strong>{e.project.title}</strong></> },
  school_received: { icon: LuHandCoins, tint: "text-emerald-600", text: (e) => <>A school received NGO funding for <strong>{e.project.title}</strong></> },
  donor_supported: { icon: LuHeart, tint: "text-violet-600", text: (e) => <>A donor supported <strong>{e.project.title}</strong></> },
};

const ago = (at) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(at).getTime()) / 60000));
  if (minutes < 60) return minutes <= 1 ? "just now" : `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
};

const Item = ({ event }) => {
  const kind = KINDS[event.kind];
  if (!kind) return null;
  const Icon = kind.icon;
  return (
    <Link to={`/projects/${event.project.id}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-colors hover:ring-blue-300">
      <Icon className={`h-4 w-4 shrink-0 ${kind.tint}`} aria-hidden="true" />
      <span className="whitespace-nowrap">{kind.text(event)}</span>
      {event.place && <span className="whitespace-nowrap text-slate-500">· {event.place}</span>}
      <span className="whitespace-nowrap text-xs text-slate-400">{ago(event.at)}</span>
    </Link>
  );
};

/**
 * "Happening on VIDYADAAN": real, recent events about approved needs, refreshed every minute while the page
 * is open. Hidden when there's nothing to show (never a made-up example).
 */
const ActivityStrip = () => {
  const [items, setItems] = useState([]);

  const load = useCallback(() => getPublicActivity().then((data) => setItems(data.items || []), () => {}), []);
  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState !== "hidden" && load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (!items.length) return null;
  return (
    <section aria-labelledby="activity-heading" className="border-y border-blue-100 bg-blue-50/60 py-4 motion-safe:animate-rise [animation-delay:700ms]">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-5 sm:px-8 lg:px-10">
        <h2 id="activity-heading" className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="hidden sm:inline">Happening on VIDYADAAN</span>
          <span className="sm:hidden">Recent</span>
        </h2>
        {/* Scrolls slowly; pauses on hover or keyboard focus; doesn't move at all for reduced motion. */}
        <div className="group relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
          <ul className="flex w-max gap-3 motion-safe:animate-marquee motion-safe:group-hover:[animation-play-state:paused] motion-safe:group-focus-within:[animation-play-state:paused]">
            {items.map((e) => (
              <li key={e.id}><Item event={e} /></li>
            ))}
            {/* The second copy makes the loop seamless; screen readers and keyboards skip it. */}
            {items.map((e) => (
              <li key={`copy-${e.id}`} aria-hidden="true" className="motion-reduce:hidden" inert>
                <Item event={e} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ActivityStrip;
