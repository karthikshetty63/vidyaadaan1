import ActivityStrip from "./ActivityStrip";
import { CONTAINER, EYEBROW, LEAD, PAGE_TITLE, SECTION_SPACING } from "./styles";

// What the platform shows, to whom, as the code does it today (public API, portals, private files).
const VISIBILITY = [
  {
    title: "Public, without an account",
    items: [
      "Needs the team has approved, each on its own page",
      "The school's name, district and state",
      "What the school asked for: its description, materials, budget estimate, students who will benefit and planned completion",
      "The work status the school sets: Open, In Progress, On Hold or Completed",
      "The amount raised and the amount still needed",
      "Recent activity, without names or amounts",
    ],
  },
  {
    title: "With an account the team has reviewed",
    items: [
      "NGOs commit to parts of a need, pay the school directly and record each payment with its proof",
      "Schools accept each recorded payment, or reject it with a reason",
      "Schools see which NGOs have committed to their needs",
      "Donors give online and see their own donations, with a downloadable report",
    ],
  },
  {
    title: "Not shown to the public",
    items: [
      "A school's bank details: shown only to an NGO that has committed to one of its needs and still has parts to pay, and to the VIDYADAAN team",
      "Registration documents, ID proofs and payment proofs",
      "Donors' names: schools and visitors see totals, not who gave",
      "Contact details, UDISE codes and photos uploaded by schools",
    ],
  },
];

/**
 * "Transparency": what is public, what needs an account and what stays private; how the team's review
 * works (and what it is not); what a need's "raised" amount means; then the recent activity.
 */
const Transparency = () => (
  <section id="transparency" aria-labelledby="transparency-heading" className="bg-white">
    <div className={`${CONTAINER} ${SECTION_SPACING}`}>
      <p className={EYEBROW}>Transparency</p>
      <h1 id="transparency-heading" className={`mt-2 ${PAGE_TITLE}`}>What is shown, and what it means</h1>
      <p className={LEAD}>VIDYADAAN shows the public what each school asked for and how much money has been confirmed for it. This is exactly what that covers.</p>

      <div className="mt-10 grid border-y border-slate-200 lg:grid-cols-3 lg:divide-x lg:divide-slate-200">
        {VISIBILITY.map(({ title, items }, i) => (
          <div key={title} className={`py-6 lg:px-6 ${i === 0 ? "lg:pl-0" : ""} ${i === VISIBILITY.length - 1 ? "lg:pr-0" : ""} ${i > 0 ? "border-t border-slate-200 lg:border-t-0" : ""}`}>
            <h2 className="font-heading text-base font-bold text-brand-navy">{title}</h2>
            <ul className="mt-3 space-y-2.5">
              {items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="font-heading text-lg font-bold text-brand-navy">Reviewed by the VIDYADAAN team</h2>
          <div className="mt-3 space-y-3 text-[15px] leading-7 text-slate-700">
            <p>
              Every school, NGO and donor account starts as pending. A person on the VIDYADAAN team looks at the details and documents submitted, and
              approves or rejects the account. Every need is reviewed the same way before it is listed; a need that is sent back comes with a reason.
            </p>
            <p>
              This is VIDYADAAN&rsquo;s own review. Documents are not checked against government records or by any other outside authority.
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-brand-navy">What &ldquo;raised&rdquo; means</h2>
          <div className="mt-3 space-y-3 text-[15px] leading-7 text-slate-700">
            <p>A need&rsquo;s raised amount adds up two kinds of money:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>an NGO&rsquo;s direct payment to the school, once the school confirms that it reached its bank account. VIDYADAAN can&rsquo;t see schools&rsquo; bank accounts, so this rests on the school&rsquo;s confirmation;</li>
              <li>an online donation, once the payment gateway confirms the payment.</li>
            </ul>
            <p>Money an NGO has only committed doesn&rsquo;t count until it is paid and confirmed.</p>
          </div>
        </div>
      </div>

      <ActivityStrip />
    </div>
  </section>
);

export default Transparency;
