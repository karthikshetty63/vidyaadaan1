import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuCircleAlert, LuClipboardList, LuSearch } from "react-icons/lu";
import { listPublicNeeds } from "../../api/public";
import PublicNeedCard from "./PublicNeedCard";

const PAGE_SIZE = 9;
const NO_FILTERS = { category: "", state: "", q: "" };

const CardSkeleton = () => (
  <div className="h-[22rem] rounded-[1.25rem] border border-[#e6edf7] bg-white p-5" aria-hidden="true">
    {["h-8 w-32", "mt-5 h-6 w-3/4", "mt-2 h-4 w-1/2", "mt-5 h-16 w-full", "mt-8 h-2 w-full", "mt-6 h-10 w-full"].map((c) => (
      <span key={c} className={`block rounded-lg bg-slate-200/70 motion-safe:animate-pulse ${c}`} />
    ))}
  </div>
);

/**
 * "Open school needs": the real, approved needs still open for support, from the server, newest first.
 * Filters by category and state (only the ones that have needs) and a search; "Show more" adds the next page.
 */
const NeedsBoard = () => {
  const [filters, setFilters] = useState(NO_FILTERS);
  const [search, setSearch] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, items: [], total: 0, page: 0, hasMore: false, error: "" });
  const [options, setOptions] = useState(null);
  const [more, setMore] = useState({ loading: false, error: "" });
  const key = `${JSON.stringify(filters)}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    listPublicNeeds({ ...filters, page: 1, limit: PAGE_SIZE }).then(
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
  }, [filters, key]);

  const loading = result.key !== key;
  const filtered = Boolean(filters.category || filters.state || filters.q);
  const set = (name, value) => setFilters((f) => ({ ...f, [name]: value }));

  const showMore = () => {
    setMore({ loading: true, error: "" });
    listPublicNeeds({ ...filters, page: result.page + 1, limit: PAGE_SIZE }).then(
      (data) => {
        setResult((r) => ({ ...r, items: [...r.items, ...data.items.filter((n) => !r.items.some((m) => m.id === n.id))], page: data.page, hasMore: data.hasMore, total: data.total }));
        setMore({ loading: false, error: "" });
      },
      (error) => setMore({ loading: false, error: error.message || "Couldn't load more needs." })
    );
  };

  return (
    <section id="needs" aria-labelledby="needs-heading" className="scroll-mt-20 px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Live from VIDYADAAN</p>
            <h2 id="needs-heading" className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">Open school needs</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Real requests from government schools, each checked and approved by our team. {!loading && !result.error && `${result.total} open right now.`}
            </p>
          </div>
          {options && (options.categories.length > 0 || filtered) && (
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
              aria-label="Filter school needs"
              onSubmit={(e) => {
                e.preventDefault();
                set("q", search.trim());
              }}
            >
              <label className="relative">
                <span className="sr-only">Search needs</span>
                <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  maxLength={60}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (!e.target.value) set("q", "");
                  }}
                  placeholder="School, district or need…"
                  className="h-11 w-full rounded-full border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:w-60"
                />
              </label>
              <label>
                <span className="sr-only">Category</span>
                <select value={filters.category} onChange={(e) => set("category", e.target.value)} className="h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:w-48">
                  <option value="">All categories</option>
                  {options.categories.map((c) => <option key={c.value} value={c.value}>{c.value} ({c.count})</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">State</span>
                <select value={filters.state} onChange={(e) => set("state", e.target.value)} className="h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:w-44">
                  <option value="">All states</option>
                  {options.states.map((st) => <option key={st.value} value={st.value}>{st.value} ({st.count})</option>)}
                </select>
              </label>
            </form>
          )}
        </div>

        <div className="mt-8" aria-live="polite" aria-busy={loading || undefined}>
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status">
              <span className="sr-only">Loading school needs…</span>
              {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {!loading && result.error && (
            <div className="flex flex-col items-center gap-3 rounded-[1.25rem] border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
              <LuCircleAlert className="h-6 w-6 text-red-600" aria-hidden="true" />
              <p className="text-sm text-red-800">The school needs couldn&rsquo;t be loaded. {result.error}</p>
              <button type="button" onClick={() => setAttempt((a) => a + 1)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100">Try again</button>
            </div>
          )}

          {!loading && !result.error && result.items.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-[1.25rem] border border-dashed border-blue-200 bg-white/70 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600" aria-hidden="true">
                <LuClipboardList className="h-6 w-6" />
              </span>
              {filtered ? (
                <>
                  <p className="font-semibold text-slate-900">No open needs match these filters</p>
                  <button type="button" onClick={() => { setFilters(NO_FILTERS); setSearch(""); }} className="text-sm font-semibold text-blue-700 underline underline-offset-2">Clear filters</button>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-900">No open needs right now</p>
                  <p className="max-w-md text-sm text-slate-600">When the VIDYADAAN team approves a school&rsquo;s request, it appears here. Is your school in need?</p>
                  <Link to="/join/school" className="text-sm font-semibold text-blue-700 underline underline-offset-2">Register your school</Link>
                </>
              )}
            </div>
          )}

          {!loading && result.items.length > 0 && (
            <>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.items.map((need) => (
                  <li key={need.id}><PublicNeedCard need={need} /></li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-sm text-slate-500">Showing {result.items.length} of {result.total}</p>
                {result.hasMore && (
                  <button type="button" onClick={showMore} disabled={more.loading} className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60">
                    {more.loading ? "Loading…" : "Show more needs"}
                  </button>
                )}
                {more.error && <p className="text-sm text-red-700" role="alert">{more.error}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NeedsBoard;
