import { FaCheckCircle, FaSchool, FaDonate, FaHandsHelping } from "react-icons/fa";

const features = [
  {
    icon: <FaSchool />,
    title: "Verified Government Schools",
    description: "Only verified government schools can raise requests, ensuring full transparency.",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  {
    icon: <FaDonate />,
    title: "Transparent Donations",
    description: "Every donation is tracked with before and after work photos for accountability.",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  {
    icon: <FaHandsHelping />,
    title: "NGO Partnership",
    description: "NGOs can adopt schools and manage social development projects end-to-end.",
    iconBg: "bg-blue-50",
    iconText: "text-blue-500",
  },
];

const FeatureSection = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
            Why VIDYADAAN
          </span>
          <h2 className="text-4xl font-bold text-slate-900">Why Choose VIDYADAAN?</h2>
          <p className="mt-4 text-slate-500">Building trust through transparency and technology.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl shadow-md p-8 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} ${feature.iconText} flex items-center justify-center text-2xl mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-7 mb-5">{feature.description}</p>
              <div className="flex items-center text-emerald-600 font-semibold gap-2 text-sm">
                <FaCheckCircle /> Trusted Platform
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
