import { Link } from "react-router-dom";
import { FaSchool, FaHandsHelping, FaHeart, FaArrowRight } from "react-icons/fa";
import Container from "../layout/Container";

const pillars = [
  {
    icon: FaSchool,
    title: "Government Schools",
    desc: "Helping schools improve classrooms, libraries, labs, and digital education.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: FaHandsHelping,
    title: "Trusted NGOs",
    desc: "NGOs verify school requirements and monitor every project end-to-end.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: FaHeart,
    title: "Transparent Donations",
    desc: "Every donation is tracked with progress updates and before/after photos.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
];

const About = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
              About VIDYADAAN
            </span>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-6">
              Bridging the Gap Between Schools and Supporters
            </h2>
            <p className="text-slate-600 leading-8 mb-8">
              VIDYADAAN is a smart school donation platform that connects Government Schools,
              NGOs, Donors, and Volunteers. Our mission is to improve educational infrastructure
              through transparent, verified, and trackable donations — ensuring every rupee
              reaches the right place.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Learn More <FaArrowRight size={13} />
            </Link>
          </div>

          {/* Right */}
          <div className="grid gap-5">
            {pillars.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-start gap-4 bg-slate-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`text-xl ${color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-6">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
};

export default About;
