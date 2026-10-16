import { LuChevronDown, LuMessageCircleQuestion } from "react-icons/lu";
import { COMMON_FAQ, PATHS } from "./paths";

// Opens the help assistant (the chat button), which listens for this.
const askAssistant = () => window.dispatchEvent(new Event("vidyadaan:open-assistant"));

/** Questions for the chosen path first, then everyone's. */
const HomeFaq = ({ path }) => {
  const own = PATHS[path]?.faq || [];
  const questions = [...own, ...COMMON_FAQ];
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20 px-5 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Questions</p>
          <h2 id="faq-heading" className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">Answers, before you sign up</h2>
          <p className="mt-3 text-slate-600">{PATHS[path] ? `The first ones are for ${PATHS[path].audience.replace("For ", "")}.` : "Choose your path above to see the questions that matter most to you first."}</p>
          <button
            type="button"
            onClick={askAssistant}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
          >
            <LuMessageCircleQuestion className="h-4 w-4" aria-hidden="true" /> Ask our help assistant
          </button>
        </div>
        <div className="space-y-3">
          {questions.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-[#e6edf7] bg-white px-5 py-4 shadow-sm open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-semibold text-slate-900 focus-visible:outline-offset-4">
                {q}
                <LuChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFaq;
