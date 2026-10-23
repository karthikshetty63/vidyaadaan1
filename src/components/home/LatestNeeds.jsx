import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { listPublicNeeds } from "../../api/public";
import PublicNeedCard, { NeedCardSkeleton } from "./PublicNeedCard";
import { BAND, BUTTON_SECONDARY, CONTAINER, EYEBROW, H2, LEAD, SECTION_SPACING } from "./styles";

const SHOWN = 3;

/**
 * The home page's "Latest open needs": the newest approved needs (real, from the server) as cards, and a link
 * to the School needs page with all of them. Says so plainly while loading, when there are none or on an error.
 */
const LatestNeeds = () => {
  const [state, setState] = useState({ loading: true, items: [], total: 0, error: false });

  useEffect(() => {
    let cancelled = false;
    listPublicNeeds({ page: 1, limit: SHOWN }).then(
      (data) => !cancelled && setState({ loading: false, items: data.items, total: data.total, error: false }),
      () => !cancelled && setState({ loading: false, items: [], total: 0, error: true })
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="latest-heading" className={BAND}>
      <div className={`${CONTAINER} ${SECTION_SPACING}`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={EYEBROW}>School needs</p>
            <h2 id="latest-heading" className={`mt-2 ${H2}`}>Latest open needs</h2>
            <p className={LEAD}>The newest requests the VIDYADAAN team has approved.</p>
          </div>
          <Link to="/needs" className={`${BUTTON_SECONDARY} shrink-0 self-start sm:self-auto`}>
            {state.total === 1 ? "See the 1 open need" : state.total > 1 ? `See all ${state.total.toLocaleString("en-IN")} open needs` : "See all open needs"}{" "}
            <LuArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8" aria-live="polite" aria-busy={state.loading || undefined}>
          {state.loading && (
            <div role="status">
              <span className="sr-only">Loading the latest needs…</span>
              <ul className="grid gap-5 lg:grid-cols-3">
                {Array.from({ length: SHOWN }, (_, i) => (
                  <li key={i}><NeedCardSkeleton /></li>
                ))}
              </ul>
            </div>
          )}
          {!state.loading && state.error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              The latest needs couldn&rsquo;t be loaded. <Link to="/needs" className="font-semibold underline underline-offset-2">Try the School needs page</Link>.
            </p>
          )}
          {!state.loading && !state.error && state.items.length === 0 && (
            <p className="rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
              No open needs right now. When the team approves a school&rsquo;s request, it appears here.{" "}
              <Link to="/join/school" className="font-semibold text-brand-navy underline underline-offset-2">Register your school</Link>
            </p>
          )}
          {state.items.length > 0 && (
            <ul className="grid gap-5 lg:grid-cols-3">
              {state.items.map((need) => (
                <li key={need.id}>
                  <PublicNeedCard need={need} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestNeeds;
