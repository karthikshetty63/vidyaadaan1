import { useRef } from "react";
import { LuBadgeCheck, LuCircleCheck, LuClipboardPen, LuHandCoins, LuShieldCheck } from "react-icons/lu";
import useInView from "../../hooks/useInView";
import { AnimatedBar, CountUp, Reveal } from "./motion";

const STEPS = [
  { icon: LuShieldCheck, title: "Register and get verified", text: "Schools, NGOs and donors sign up with their documents. A person from our team checks every account." },
  { icon: LuClipboardPen, title: "A school posts a specific need", text: "What's wrong, the budget, the priority and how many students it will help." },
  { icon: LuBadgeCheck, title: "The need is reviewed", text: "Only approved needs reach NGOs and donors. Anything unclear goes back to the school with a reason." },
  { icon: LuHandCoins, title: "It gets funded, and you can follow it", text: "NGOs and donors fund it; the school confirms money that reaches it and updates the work's progress." },
];

// An example only (its numbers are illustrative, and the picture says so).
const EXAMPLE_PARTS = [
  { label: "NGO, received", tone: "bg-emerald-500 text-white" },
  { label: "NGO, received", tone: "bg-emerald-500 text-white" },
  { label: "NGO, paying", tone: "bg-emerald-200 text-emerald-900" },
  { label: "Open", tone: "bg-white text-slate-500" },
  { label: "Open", tone: "bg-white text-slate-500" },
];
const OPEN_PART = "bg-white text-slate-500";

/** The four steps, with the line between them drawing itself downwards as they come into view. */
const Steps = () => {
  const ref = useRef(null);
  const shown = useInView(ref, { threshold: 0.3 });
  return (
    <ol ref={ref} className="relative mt-8 space-y-6">
      <span
        aria-hidden="true"
        className={`absolute left-[21px] top-6 bottom-6 w-0.5 origin-top rounded-full bg-gradient-to-b from-blue-300 to-blue-100 transition-transform duration-[1600ms] ease-out motion-reduce:transition-none ${shown ? "scale-y-100" : "scale-y-0"}`}
      />
      {STEPS.map(({ icon: Icon, title, text }, i) => (
        <Reveal as="li" key={title} from="left" delay={i * 200} className="relative flex gap-4">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-inset ring-[#e6edf7]">
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">{i + 1}</span>
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
};

/** The 5-part example: the parts light up one by one, then the bar fills and the amount counts up. */
const PartsExample = () => {
  const ref = useRef(null);
  const shown = useInView(ref, { threshold: 0.4 });
  return (
    <div ref={ref}>
      <p className="mt-6 text-sm font-semibold text-slate-900">Science lab benches · budget ₹1,00,000</p>
      <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-label="Five parts of ₹20,000">
        {EXAMPLE_PARTS.map((part, i) => (
          <li
            key={i}
            style={{ transitionDelay: `${300 + i * 280}ms` }}
            className={`flex flex-col items-center justify-center rounded-xl px-1 py-3 text-center ring-1 ring-inset transition-[background-color,color,scale,box-shadow] duration-500 motion-reduce:transition-none ${
              shown && i < 3 ? `${part.tone} scale-100 shadow-md shadow-emerald-900/10 ring-transparent` : shown ? `${OPEN_PART} scale-100 ring-slate-200` : `${OPEN_PART} scale-95 ring-slate-200`
            }`}
          >
            <span className="text-xs font-bold">Part {i + 1}</span>
            <span className="mt-0.5 text-[11px] leading-tight">₹20,000</span>
            <span className="mt-1 hidden text-[10px] leading-tight sm:block">{part.label}</span>
          </li>
        ))}
      </ol>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" /> Paid and received by the school</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-200" aria-hidden="true" /> Promised, payment on its way</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full ring-1 ring-slate-300" aria-hidden="true" /> Open for an NGO</li>
      </ul>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-slate-900">
            <CountUp value={40000} format={(n) => `₹${n.toLocaleString("en-IN")}`} duration={1400} delay={1300} /> raised
          </span>
          <span className="text-slate-500">40% of ₹1,00,000</span>
        </div>
        <AnimatedBar value={40} label="Example: 40% funded" delay={1300} className="mt-2" />
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-600">
          <LuCircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
          Only confirmed money counts as raised: a promise isn&rsquo;t money until it arrives.
        </p>
      </div>
    </div>
  );
};

/** How VIDYADAAN works in four steps, and the 5-part funding that lets even a small NGO help. */
const HowItWorks = () => (
  <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 px-5 sm:px-8 lg:px-10">
    <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">How it works</p>
          <h2 id="how-heading" className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">From a school&rsquo;s request to finished work</h2>
        </Reveal>
        <Steps />
      </div>

      <Reveal as="figure" from="zoom" delay={150} className="rounded-[1.75rem] border border-white bg-white p-6 shadow-[0_24px_60px_-28px_rgb(30_64_175/0.25)] sm:p-8" aria-labelledby="parts-heading">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="parts-heading" className="font-heading text-xl font-extrabold text-brand-navy">Every budget in 5 equal parts</h3>
            <p className="mt-1 text-sm text-slate-600">NGOs fund one part, a few, or all five, so even a small NGO can help.</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Example</span>
        </div>
        <PartsExample />
      </Reveal>
    </div>
  </section>
);

export default HowItWorks;
