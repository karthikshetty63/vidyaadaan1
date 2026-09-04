import React, { useState } from "react";
import Container from "../layout/Container";
import SectionTitle from "../ui/SectionTitle";

const faqs = [
  {
    q: "Is my donation 100% tax-deductible under Section 80G?",
    a: "Yes. VIDYADAAN is registered under Section 80G of the Income Tax Act. You will receive an auto-generated digital tax receipt within 24 hours of your donation.",
  },
  {
    q: "How do I know my money actually reaches the school?",
    a: "Every project has a ring-fenced fund account. We release payments to vendors in milestones—and document each with photos, government sign-off, and a completion certificate visible in your donor dashboard.",
  },
  {
    q: "Can I donate offline or via bank transfer?",
    a: "Yes. Write to hello@vidyadaan.org and our team will arrange a bank transfer option. We accept NEFT/RTGS and corporate cheques as well.",
  },
  {
    q: "What happens if a project doesn't reach its funding target?",
    a: "If a project falls short of its goal after 90 days, donors are given the choice to redirect their donation to another project or receive a full refund.",
  },
  {
    q: "How does child sponsorship work exactly?",
    a: "You're matched with a verified child based on age, grade, and need. ₹1,000–₹1,500/month covers tuition, books, uniforms, and nutrition. You receive quarterly updates directly from the field team.",
  },
  {
    q: "Can a company donate for CSR purposes?",
    a: "Absolutely. VIDYADAAN qualifies as a CSR beneficiary under Schedule VII of the Companies Act 2013 under education and rural development. Contact us at csr@vidyadaan.org.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <Container narrow>
        <div className="text-center mb-12">
          <SectionTitle
            pill="FAQ"
            title="Frequently Asked"
            highlight="Questions"
            subtitle="Everything you need to know before making your first donation or sponsoring a child."
          />
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                openIndex === i
                  ? "border-sky-300 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                    openIndex === i
                      ? "bg-sky-600 text-white rotate-180"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">
            Still have questions?{" "}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sky-600 font-bold hover:underline"
            >
              Contact our team →
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
