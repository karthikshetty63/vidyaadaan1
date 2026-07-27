import { useState } from "react";
import Container from "../layout/Container";
import faqData from "../../data/faqData";
import { FaChevronDown } from "react-icons/fa";

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-slate-50 transition-colors duration-200"
    >
      <span className="font-semibold text-slate-800">{question}</span>
      <FaChevronDown
        className={`text-blue-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    {isOpen && (
      <div className="px-6 pb-5 bg-white">
        <p className="text-slate-500 leading-7 text-sm">{answer}</p>
      </div>
    )}
  </div>
);

const FAQ = () => {
  const [openId, setOpenId] = useState(1);

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-4xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            Everything you need to know about VIDYADAAN.
          </p>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {faqData.map((item) => (
            <FAQItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
