import { createElement } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight, LuFileText, LuInfo } from "react-icons/lu";
import { PATHS, PATH_LOOK } from "./paths";

/** What the chosen path does, step by step, with its buttons. Before a choice, a short prompt. */
const PathPanel = ({ path }) => {
  const p = PATHS[path];
  return (
    <section id="your-path" aria-labelledby="path-heading" className="scroll-mt-24 px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        {!p ? (
          <div className="rounded-[1.75rem] border border-dashed border-blue-200 bg-white/70 px-6 py-8 text-center">
            <h2 id="path-heading" className="font-heading text-xl font-extrabold text-brand-navy">Your path on VIDYADAAN</h2>
            <p className="mt-2 text-sm text-slate-600">Choose School, NGO, Donor or Former student above to see your steps, what to keep ready and where to start.</p>
          </div>
        ) : (
          <div key={path} className="grid gap-8 rounded-[1.75rem] border border-white bg-white p-6 shadow-[0_24px_60px_-28px_rgb(30_64_175/0.25)] motion-safe:animate-view-enter sm:p-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div>
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${PATH_LOOK[path].tint}`} aria-hidden="true">
                  {createElement(PATH_LOOK[path].icon, { className: "h-6 w-6" })}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{p.audience}</p>
                  <h2 id="path-heading" className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy">{p.title}</h2>
                </div>
              </div>
              <ol className="mt-7 space-y-4">
                {/* Each step rises in after the one before it (whenever the path changes). */}
                {p.steps.map((step, i) => (
                  <li key={step} className="flex gap-4 motion-safe:animate-rise" style={{ animationDelay: `${150 + i * 120}ms` }}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span>
                    <p className="pt-1 text-[15px] leading-relaxed text-slate-700">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-2xl bg-slate-50 p-6 motion-safe:animate-rise [animation-delay:250ms]">
              {p.haveReady.length > 0 ? (
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <LuFileText className="h-4 w-4" aria-hidden="true" /> Have these ready
                  </p>
                  <ul className="mt-3 space-y-2">
                    {p.haveReady.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-slate-500">PDF, JPG, PNG or WebP, up to 5 MB each.</p>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">No sign-up is needed to follow your school. Share its needs with your batch, or give from a donor account.</p>
              )}
              {p.note && (
                <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-900 ring-1 ring-inset ring-amber-200">
                  <LuInfo className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {p.note}
                </p>
              )}
              <div className="flex flex-col gap-2.5">
                {p.primary.to.startsWith("/#") ? (
                  <a href={p.primary.to.slice(1)} className="btn-shine group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-600">
                    {p.primary.label} <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
                  </a>
                ) : (
                  <Link to={p.primary.to} className="btn-shine group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-600">
                    {p.primary.label} <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
                  </Link>
                )}
                <Link to={p.secondary.to} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
                  {p.secondary.label}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PathPanel;
