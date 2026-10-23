import { Link } from "react-router-dom";
import { LuChevronDown, LuMessageCircleQuestion } from "react-icons/lu";
import { COMMON_FAQ, PATHS } from "./paths";
import { BAND, BUTTON_SECONDARY, CONTAINER, EYEBROW, PAGE_TITLE, SECTION_SPACING } from "./styles";

// Opens the help assistant (the chat button), which listens for this.
const askAssistant = () => window.dispatchEvent(new Event("vidyadaan:open-assistant"));

/** Questions for the chosen path first, then everyone's. */
const HomeFaq = ({ path }) => {
  const own = PATHS[path]?.faq || [];
  const questions = [...own, ...COMMON_FAQ];
  return (
    <section id="faq" aria-labelledby="faq-heading" className={BAND}>
      <div className={`${CONTAINER} ${SECTION_SPACING} grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]`}>
        <div>
          <p className={EYEBROW}>Questions</p>
          <h1 id="faq-heading" className={`mt-2 ${PAGE_TITLE}`}>Answers, before you sign up</h1>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            {PATHS[path] ? (
              `The first ones are for ${PATHS[path].audience.replace("For ", "")}.`
            ) : (
              <>
                Say who you are on the{" "}
                <Link to="/take-part" className="font-semibold text-brand-navy underline underline-offset-2 hover:decoration-2">Take part</Link>{" "}
                page, and the questions that matter most to you come first.
              </>
            )}
          </p>
          <button type="button" onClick={askAssistant} className={`mt-6 ${BUTTON_SECONDARY}`}>
            <LuMessageCircleQuestion className="h-4 w-4" aria-hidden="true" /> Ask our help assistant
          </button>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {questions.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold text-slate-900 hover:text-brand-navy focus-visible:outline-offset-2">
                {q}
                <LuChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p className="pb-5 pr-8 text-[15px] leading-7 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFaq;
