import { Link } from "react-router-dom";
import { LuArrowRight, LuCheck, LuSchool } from "react-icons/lu";
import { PATHS, PATH_LOOK, PATH_ORDER } from "./paths";

const TRUST = ["Every account checked by a person", "Every project reviewed before it's listed", "Only confirmed money counts as raised", "Free for schools, NGOs and donors"];

/** The first screen: what VIDYADAAN is, and "I am a…" so the rest of the page fits the visitor. */
const HomeHero = ({ path, onChoose }) => (
  <section aria-labelledby="hero-heading" className="relative overflow-clip">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-blue-100/70" />
      <div className="absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
    </div>

    <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 lg:px-10 lg:pb-20 lg:pt-16">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-1.5 text-sm font-semibold text-blue-700">
          <LuSchool className="h-4 w-4" aria-hidden="true" /> For government schools in India
        </p>
        <h1 id="hero-heading" className="mt-5 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-brand-navy sm:text-5xl xl:text-[3.5rem]">
          Every school need,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">verified and funded in the open.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
          VIDYADAAN connects government schools with NGOs, donors and former students. Schools post what their students need; our team checks every
          school and every request before anyone can fund it.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#needs" className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-blue-600">
            See open needs <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
          </a>
          <Link to="/join" className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-6 text-[15px] font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
            Get started
          </Link>
        </div>
        <ul className="mt-8 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {TRUST.map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">
                <LuCheck className="h-3 w-3" strokeWidth={3} />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* "Choose your path": the sections below change to fit the choice. */}
      <div className="rounded-[1.75rem] border border-white bg-white/95 p-6 shadow-[0_24px_60px_-24px_rgb(30_64_175/0.25)] sm:p-8">
        <h2 className="font-heading text-xl font-extrabold tracking-tight text-brand-navy">I am a…</h2>
        <p className="mt-1 text-sm text-slate-500">Choose one, and the page shows what matters to you.</p>
        <fieldset className="mt-5">
          <legend className="sr-only">I am a</legend>
          <div className="space-y-2.5">
            {PATH_ORDER.map((key) => {
              const { icon: Icon, tint, ring } = PATH_LOOK[key];
              const selected = path === key;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-3 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-600 ${
                    selected ? `ring-1 ${ring} shadow-md shadow-slate-900/5` : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                >
                  <input type="radio" name="home-path" value={key} checked={selected} onChange={() => onChoose(key)} className="sr-only" />
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-slate-900">{PATHS[key].label}</span>
                    <span className="block text-sm text-slate-500">{PATHS[key].who}</span>
                  </span>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`} aria-hidden="true">
                    <LuCheck className={`h-3.5 w-3.5 ${selected ? "opacity-100" : "opacity-0"}`} strokeWidth={3} />
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  </section>
);

export default HomeHero;
