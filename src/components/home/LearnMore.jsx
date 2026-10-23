import { Link } from "react-router-dom";
import { LuArrowRight, LuEye, LuEyeOff, LuListOrdered, LuMessageCircleQuestion, LuSignpost } from "react-icons/lu";
import { COMMON_FAQ, PATH_LOOK, PATH_ORDER, PATHS, savePath } from "./paths";
import { CONTAINER, EYEBROW, H2, LEAD, SECTION_SPACING } from "./styles";

const PREVIEW_LABEL = "text-sm font-semibold text-slate-800";

/**
 * One topic as a card: what the page answers and a small preview of it. The title's link covers the whole
 * card; anything clickable inside the preview sits above that link.
 */
const TopicCard = ({ to, icon: Icon, title, text, more, children }) => (
  <li className="group relative flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-400 sm:p-7">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-navy text-white" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-heading text-lg font-bold text-brand-navy group-hover:underline group-hover:underline-offset-2">
        <Link to={to} className="after:absolute after:inset-0 after:rounded-lg">{title}</Link>
      </h3>
    </div>
    <p className="mt-3 text-[15px] leading-6 text-slate-600">{text}</p>
    <div className="mt-5 flex-1 rounded-md bg-slate-50 p-4">{children}</div>
    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy" aria-hidden="true">
      {more}
      <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </p>
  </li>
);

// An example only (it says so): one budget in 5 equal parts, 2 of them paid. The How it works page explains it.
const EXAMPLE_PAID = 2;
const FundingPreview = () => (
  <>
    <p className={PREVIEW_LABEL}>Example: one budget in 5 equal parts</p>
    <ol className="mt-3 grid grid-cols-5 gap-1.5">
      {[1, 2, 3, 4, 5].map((part) => (
        <li
          key={part}
          className={`rounded px-1 py-2 text-center text-xs font-semibold ${part <= EXAMPLE_PAID ? "bg-emerald-600 text-white" : "bg-white text-slate-500 ring-1 ring-inset ring-slate-300"}`}
        >
          Part {part}
          <span className="sr-only">: {part <= EXAMPLE_PAID ? "paid" : "open"}</span>
        </li>
      ))}
    </ol>
    <p className="mt-3 text-sm leading-6 text-slate-600">An NGO can fund one part, several or all five. Here, 2 are paid and confirmed by the school.</p>
  </>
);

// "I am a…": opens the Take part page with that role already chosen.
const RolePreview = () => (
  <>
    <p id="learn-roles" className={PREVIEW_LABEL}>I am a…</p>
    <ul className="mt-3 flex flex-wrap gap-2" aria-labelledby="learn-roles">
      {PATH_ORDER.map((key) => {
        const Icon = PATH_LOOK[key].icon;
        return (
          <li key={key}>
            <Link
              to="/take-part"
              onClick={() => savePath(key)}
              className="relative z-10 flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition-colors hover:border-brand-navy hover:text-brand-navy"
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              {PATHS[key].label}
            </Link>
          </li>
        );
      })}
    </ul>
  </>
);

// The short version of the Transparency page's "Public" and "Not shown to the public" lists.
const VISIBILITY = [
  { title: "Public", icon: LuEye, items: ["Approved needs and their budgets", "Amount raised and still needed"] },
  { title: "Not public", icon: LuEyeOff, items: ["Schools' bank details and documents", "Donors' names"] },
];
const VisibilityPreview = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    {VISIBILITY.map(({ title, icon: Icon, items }) => (
      <div key={title}>
        <p className={`flex items-center gap-1.5 ${PREVIEW_LABEL}`}>
          <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" /> {title}
        </p>
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-sm leading-5 text-slate-600">{item}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

// Two of the questions everyone asks, word for word from the Questions page.
const QuestionsPreview = () => (
  <>
    <p className={PREVIEW_LABEL}>People often ask</p>
    <ul className="mt-2 divide-y divide-slate-200">
      {COMMON_FAQ.slice(0, 2).map(([question]) => (
        <li key={question} className="py-2 text-sm text-slate-700 last:pb-0">{question}</li>
      ))}
    </ul>
  </>
);

/** The home page's "Learn more": the four topic pages as cards, each with a small preview of what it covers. */
const LearnMore = () => (
  <section aria-labelledby="learn-heading" className="bg-white">
    <div className={`${CONTAINER} ${SECTION_SPACING}`}>
      <p className={EYEBROW}>Learn more</p>
      <h2 id="learn-heading" className={`mt-2 ${H2}`}>Know how it works before you take part</h2>
      <p className={LEAD}>Each topic has its own page with the details.</p>

      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        <TopicCard
          to="/how-it-works"
          icon={LuListOrdered}
          title="How it works"
          text="The 5 steps from a school's request to finished work, and how funding adds up."
          more="See all 5 steps"
        >
          <FundingPreview />
        </TopicCard>
        <TopicCard
          to="/take-part"
          icon={LuSignpost}
          title="Ways to take part"
          text="The steps and the documents to keep ready, for each kind of member."
          more="See every role"
        >
          <RolePreview />
        </TopicCard>
        <TopicCard
          to="/transparency"
          icon={LuEye}
          title="Transparency"
          text="What anyone can see, what stays private, how the team reviews, and what “raised” means."
          more="See what is shown"
        >
          <VisibilityPreview />
        </TopicCard>
        <TopicCard
          to="/faq"
          icon={LuMessageCircleQuestion}
          title="Questions"
          text="Answers before you sign up, and a help assistant for anything else."
          more="Read all answers"
        >
          <QuestionsPreview />
        </TopicCard>
      </ul>
    </div>
  </section>
);

export default LearnMore;
