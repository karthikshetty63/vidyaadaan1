import Container from "../layout/Container";
import { FaSchool, FaClipboardList, FaHandsHelping, FaDonate, FaHammer, FaCheckCircle } from "react-icons/fa";

const steps = [
  { icon: FaSchool, title: "School Registration", desc: "Government schools register and complete their verified profile.", color: "text-blue-600", bg: "bg-blue-50", step: "01" },
  { icon: FaClipboardList, title: "Submit Requirements", desc: "Schools upload infrastructure needs with photos and estimated costs.", color: "text-emerald-600", bg: "bg-emerald-50", step: "02" },
  { icon: FaHandsHelping, title: "NGO Verification", desc: "NGOs verify the request before publishing it for donations.", color: "text-blue-500", bg: "bg-blue-50", step: "03" },
  { icon: FaDonate, title: "Donor Contribution", desc: "Donors choose projects and contribute securely.", color: "text-emerald-500", bg: "bg-emerald-50", step: "04" },
  { icon: FaHammer, title: "Project Execution", desc: "The school completes the work and uploads progress updates.", color: "text-blue-600", bg: "bg-blue-50", step: "05" },
  { icon: FaCheckCircle, title: "Impact Report", desc: "Donors receive completion reports with before and after photos.", color: "text-emerald-600", bg: "bg-emerald-50", step: "06" },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-slate-50">
      <Container>
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
            How It Works
          </span>
          <h2 className="text-4xl font-bold text-slate-900">
            The VIDYADAAN Process
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            A transparent 6-step process connecting schools, NGOs, and donors to improve educational infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {steps.map(({ icon: Icon, title, desc, color, bg, step }) => (
            <div
              key={step}
              className="bg-white p-7 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`text-xl ${color}`} />
                </div>
                <span className="text-4xl font-black text-slate-100">{step}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-6">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
