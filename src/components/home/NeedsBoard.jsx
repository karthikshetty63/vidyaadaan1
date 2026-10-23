import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LuCircleAlert, LuLoaderCircle, LuSchool, LuSearch, LuSearchX, LuX } from "react-icons/lu";
import { listPublicNeeds } from "../../api/public";
import CategoryIcon from "../ui/CategoryIcon";
import PublicNeedCard, { NeedCardSkeleton } from "./PublicNeedCard";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CONTAINER, EYEBROW, PAGE_TITLE } from "./styles";

const PAGE_SIZE = 9;
const SEARCH_MAX = 60;
const SEARCH_DELAY = 350; // ms after the last key press

const FIELD =
  "h-11 w-full rounded-md border border-slate-300 bg-white text-[15px] text-slate-800 placeholder:text-slate-400 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-slate-900/10";
const chip = (on) =>
  `inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-[background-color,border-color,color,scale] duration-200 active:scale-95 motion-safe:animate-pop ${
    on ? "border-brand-navy bg-brand-navy text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"
  }`;
const chipCount = (on) => `rounded-full px-1.5 text-xs font-semibold tabular-nums transition-colors duration-200 ${on ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`;

// One after another: an element's start delay in the page's entrance (ms).
const delay = (ms) => ({ animationDelay: `${ms}ms` });
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** A number that counts up to its value when it appears (at once when the device asks for less motion). */
const CountUp = ({ value, duration = 900 }) => {
  const [shown, setShown] = useState(() => (reducedMotion() ? value : 0));
  const shownRef = useRef(shown);
  useEffect(() => {
    const from = shownRef.current;
    if (from === value) return undefined;
    const ms = reducedMotion() ? 0 : duration;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const t = ms ? Math.min(1, (now - start) / ms) : 1;
      const next = Math.round(from + (value - from) * (1 - (1 - t) ** 3));
      shownRef.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return (
    <>
      <span aria-hidden="true">{shown.toLocaleString("en-IN")}</span>
      <span className="sr-only">{value.toLocaleString("en-IN")}</span>
    </>
  );
};

/** A friendly box for "nothing here", with one next step. */
const EmptyState = ({ icon: Icon, title, text, children }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center motion-safe:animate-rise">
    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-hidden="true">
      <Icon className="h-6 w-6" />
    </span>
    <h2 className="mt-4 font-heading text-lg font-bold text-brand-navy">{title}</h2>
    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">{text}</p>
    <div className="mt-5">{children}</div>
  </div>
);

/**
 * "Open school needs": the real, approved needs still open for support, from the server, newest first.
 * A search (as you type), a state and the categories (only the ones that have needs, with counts) filter
 * the list; the filters live in the page's address, so a filtered list can be shared. "Show more" adds the
 * next page.
 */
const NeedsBoard = () => {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const state = params.get("state") || "";
  const q = (params.get("q") || "").trim().slice(0, SEARCH_MAX);

  const [search, setSearch] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, items: [], total: 0, page: 0, hasMore: false, error: "" });
  const [options, setOptions] = useState(null);
  const [more, setMore] = useState({ key: null, loading: false, error: "" });
  const key = JSON.stringify([category, state, q, attempt]);

  // The address changed some other way (a link to /needs, "Clear all"): the search box follows it.
  if (q !== syncedQ) {
    setSyncedQ(q);
    if (search.trim() !== q) setSearch(q);
  }

  /** Sets one filter in the page's address, without adding a step to the browser's history. */
  const setFilter = useCallback(
    (name, value) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(name, value);
          else next.delete(name);
          return next;
        },
        { replace: true }
      ),
    [setParams]
  );

  // Search as you type, once typing pauses.
  useEffect(() => {
    const typed = search.trim();
    if (typed === q) return undefined;
    const timer = setTimeout(() => setFilter("q", typed), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [search, q, setFilter]);

  useEffect(() => {
    let cancelled = false;
    listPublicNeeds({ category, state, q, page: 1, limit: PAGE_SIZE }).then(
      (data) => {
        if (cancelled) return;
        setResult({ key, items: data.items, total: data.total, page: data.page, hasMore: data.hasMore, error: "" });
        setOptions(data.filters);
      },
      (error) => !cancelled && setResult({ key, items: [], total: 0, page: 0, hasMore: false, error: error.message || "Couldn't load the needs." })
    );
    return () => {
      cancelled = true;
    };
  }, [category, state, q, key]);

  const loading = result.key !== key;
  const firstLoad = result.key === null;
  const filtered = Boolean(category || state || q);
  // Every open need has one category, so the category counts add up to all open needs (whatever is filtered).
  const openTotal = options ? options.categories.reduce((sum, c) => sum + c.count, 0) : 0;

  const clearAll = () => {
    setSearch("");
    setParams({}, { replace: true });
  };
  const active = [
    category && { name: "category", label: category },
    state && { name: "state", label: state },
    q && { name: "q", label: `“${q}”` },
  ].filter(Boolean);
  const remove = (name) => {
    if (name === "q") setSearch("");
    setFilter(name, "");
  };

  const showMore = () => {
    const forKey = key;
    setMore({ key: forKey, loading: true, error: "" });
    listPublicNeeds({ category, state, q, page: result.page + 1, limit: PAGE_SIZE }).then(
      (data) => {
        setResult((r) =>
          r.key !== forKey
            ? r
            : { ...r, items: [...r.items, ...data.items.filter((n) => !r.items.some((m) => m.id === n.id))], page: data.page, hasMore: data.hasMore, total: data.total }
        );
        setMore({ key: forKey, loading: false, error: "" });
      },
      (error) => setMore({ key: forKey, loading: false, error: error.message || "Couldn't load more needs." })
    );
  };

  const count = result.total;
  const summary = loading
    ? "Loading…"
    : result.error
      ? ""
      : filtered
        ? `${count.toLocaleString("en-IN")} ${count === 1 ? "need matches" : "needs match"}`
        : `${count.toLocaleString("en-IN")} open ${count === 1 ? "need" : "needs"}, newest first`;

  return (
    <section id="needs" aria-labelledby="needs-heading">
      {/* The page's top: what this list is, the real counts, and the filters. */}
      <div className="border-b border-slate-200 bg-white">
        <div className={`${CONTAINER} pb-8 pt-10 lg:pt-14`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className={`${EYEBROW} motion-safe:animate-rise`}>School needs</p>
              <h1 id="needs-heading" className={`mt-2 ${PAGE_TITLE} motion-safe:animate-rise`} style={delay(70)}>Open school needs</h1>
              <p className="mt-3 text-base leading-7 text-slate-600 motion-safe:animate-rise" style={delay(140)}>
                Every request here was reviewed by the VIDYADAAN team and still needs support.
              </p>
            </div>
            {openTotal > 0 && (
              <dl className="flex gap-8 lg:gap-10">
                {[
                  ["Open needs", openTotal],
                  [options.states.length === 1 ? "State" : "States", options.states.length],
                  [options.categories.length === 1 ? "Category" : "Categories", options.categories.length],
                ].map(([label, value], i) => (
                  <div key={label} className="flex flex-col-reverse gap-1 motion-safe:animate-rise" style={delay(i * 90)}>
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="font-heading text-[1.75rem] font-bold leading-none tabular-nums text-brand-navy">
                      <CountUp value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {openTotal > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex flex-col gap-3 motion-safe:animate-rise sm:flex-row" style={delay(120)}>
                <form
                  role="search"
                  className="relative flex-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFilter("q", search.trim());
                  }}
                >
                  <label htmlFor="needs-search" className="sr-only">Search school needs</label>
                  {/* While results load, the magnifier turns into a small spinner. */}
                  {loading && !firstLoad ? (
                    <LuLoaderCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-navy motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  )}
                  <input
                    id="needs-search"
                    type="search"
                    value={search}
                    maxLength={SEARCH_MAX}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by need, school or district"
                    className={`${FIELD} pl-10 pr-3 transition-[border-color,box-shadow] duration-200`}
                  />
                </form>
                <label className="sm:w-60">
                  <span className="sr-only">State</span>
                  <select value={state} onChange={(e) => setFilter("state", e.target.value)} className={`${FIELD} px-3`}>
                    <option value="">All states</option>
                    {options.states.map((s) => (
                      <option key={s.value} value={s.value}>{s.value} ({s.count})</option>
                    ))}
                    {/* A shared link can name a state that has no open needs any more. */}
                    {state && !options.states.some((s) => s.value === state) && <option value={state}>{state} (0)</option>}
                  </select>
                </label>
              </div>

              {/* Phones: one row that scrolls sideways (the cut-off button at the edge shows there is more). */}
              <div
                role="group"
                aria-label="Category"
                className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                <button type="button" aria-pressed={!category} onClick={() => setFilter("category", "")} className={chip(!category)} style={delay(200)}>
                  All categories <span className={chipCount(!category)}>{openTotal}</span>
                </button>
                {options.categories.map(({ value, count: n }, i) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={category === value}
                    onClick={() => setFilter("category", category === value ? "" : value)}
                    className={chip(category === value)}
                    style={delay(Math.min(240 + i * 40, 720))}
                  >
                    <CategoryIcon category={value} className="h-4 w-4" />
                    {value} <span className={chipCount(category === value)}>{n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The needs. */}
      <div className="bg-slate-50">
        <div className={`${CONTAINER} pb-16 pt-8 lg:pb-20`}>
          {!firstLoad && (filtered || count > 0) && (
            <div className="mb-5 flex min-h-8 flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-sm font-medium text-slate-700" aria-live="polite">
                <span key={summary} className="inline-block motion-safe:animate-fade">{summary}</span>
              </p>
              {active.map((f) => (
                <button
                  key={`${f.name}:${f.label}`}
                  type="button"
                  onClick={() => remove(f.name)}
                  aria-label={`Remove filter: ${f.label}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-300 bg-white pl-3 pr-2 text-sm text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 motion-safe:animate-pop"
                >
                  {f.label} <LuX className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                </button>
              ))}
              {active.length > 1 && (
                <button type="button" onClick={clearAll} className="text-sm font-semibold text-brand-navy underline underline-offset-2 hover:decoration-2">
                  Clear all
                </button>
              )}
            </div>
          )}

          <div aria-busy={loading || undefined}>
            {firstLoad && (
              <div role="status">
                <span className="sr-only">Loading school needs…</span>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <li key={i}><NeedCardSkeleton /></li>
                  ))}
                </ul>
              </div>
            )}

            {!loading && result.error && (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-5 sm:flex-row sm:items-center" role="alert">
                <LuCircleAlert className="h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
                <p className="flex-1 text-sm text-red-800">The school needs couldn&rsquo;t be loaded. {result.error}</p>
                <button type="button" onClick={() => setAttempt((a) => a + 1)} className="inline-flex h-10 items-center rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-800 hover:bg-red-100">
                  Try again
                </button>
              </div>
            )}

            {!loading && !result.error && result.items.length === 0 &&
              (filtered ? (
                <EmptyState icon={LuSearchX} title="No open needs match" text="Try another word, another state or all categories.">
                  <button type="button" onClick={clearAll} className={BUTTON_SECONDARY}>Clear filters</button>
                </EmptyState>
              ) : (
                <EmptyState icon={LuSchool} title="No open needs right now" text="When the VIDYADAAN team approves a school’s request, it appears here. Is your school in need?">
                  <Link to="/join/school" className={BUTTON_PRIMARY}>Register your school</Link>
                </EmptyState>
              ))}

            {/* While new filters load, the current cards stay (dimmed) instead of jumping to placeholders. New
                results rise in one after another (their funding bars fill after them); "Show more" cards too. */}
            {!firstLoad && result.items.length > 0 && (
              <ul className={`grid gap-5 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
                {result.items.map((need, i) => (
                  <li
                    key={`${result.key}:${need.id}`}
                    className="motion-safe:animate-rise"
                    style={{ ...delay(Math.min((i % PAGE_SIZE) * 60, 480)), "--enter-delay": `${Math.min((i % PAGE_SIZE) * 60, 480)}ms` }}
                  >
                    <PublicNeedCard need={need} titleAs="h2" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!loading && result.items.length > 0 && (result.hasMore || result.total > PAGE_SIZE) && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-slate-500">
                Showing {result.items.length.toLocaleString("en-IN")} of {result.total.toLocaleString("en-IN")}
              </p>
              {result.hasMore && (
                <button type="button" onClick={showMore} disabled={more.loading} className={`${BUTTON_SECONDARY} disabled:opacity-60`}>
                  {more.loading && more.key === key ? "Loading…" : "Show more needs"}
                </button>
              )}
              {more.error && more.key === key && <p className="text-sm text-red-700" role="alert">{more.error}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NeedsBoard;
