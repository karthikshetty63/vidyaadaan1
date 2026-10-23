import { createElement } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight, LuInfo } from "react-icons/lu";
import { PATHS, PATH_LOOK, PATH_ORDER } from "./paths";
import { BAND, BUTTON_PRIMARY, BUTTON_SECONDARY, CONTAINER, EYEBROW, LEAD, PAGE_TITLE, SECTION_SPACING } from "./styles";

/**
 * "Ways to take part": the visitor says who they are (School, NGO, Donor or Former student) and sees that
 * path's steps, what to keep ready and where to start. The choice is remembered on this device (the Take part
 * page saves it) and also puts that path's questions first in the FAQ.
 */
const PathPanel = ({ path, onChoose }) => {
  const p = PATHS[path];
  return (
    <section id="your-path" aria-labelledby="path-heading" className={BAND}>
      <div className={`${CONTAINER} ${SECTION_SPACING}`}>
        <p className={EYEBROW}>Ways to take part</p>
        <h1 id="path-heading" className={`mt-2 ${PAGE_TITLE}`}>What you can do on VIDYADAAN</h1>
        <p className={LEAD}>Choose who you are to see the steps, what to keep ready and where to start.</p>

        <fieldset className="mt-8">
          <legend className="sr-only">I am a</legend>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {PATH_ORDER.map((key) => {
              const selected = path === key;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-[15px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-navy ${
                    selected ? "border-brand-navy bg-brand-navy text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"
                  }`}
                >
                  <input type="radio" name="home-path" value={key} checked={selected} onChange={() => onChoose(key)} className="sr-only" />
                  {createElement(PATH_LOOK[key].icon, { className: "h-4 w-4", "aria-hidden": "true" })}
                  {PATHS[key].label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {!p ? (
          <p className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-6 text-[15px] text-slate-600">
            Choose School, NGO, Donor or Former student to see your steps, what to keep ready and where to start.
          </p>
        ) : (
          <div key={path} className="mt-6 grid gap-8 rounded-lg border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
            <div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{p.audience}</span> · {p.who}
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold text-brand-navy">{p.title}</h2>
              <ol className="mt-6 space-y-4">
                {p.steps.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-brand-navy ring-1 ring-inset ring-slate-200">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 text-[15px] leading-relaxed text-slate-700">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-6 border-t border-slate-200 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              {p.haveReady.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-800">Keep these ready</p>
                  <ul className="mt-3 space-y-2">
                    {p.haveReady.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-slate-500">PDF, JPG, PNG or WebP, up to 5 MB each.</p>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">No sign-up is needed to follow your school. Share its needs with your batch, or give from a donor account.</p>
              )}
              {p.note && (
                <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  <LuInfo className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {p.note}
                </p>
              )}
              <div className="flex flex-col gap-2.5">
                <Link to={p.primary.to} className={BUTTON_PRIMARY}>
                  {p.primary.label} <LuArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to={p.secondary.to} className={BUTTON_SECONDARY}>
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
