import { FaSchool, FaDonate, FaHandsHelping, FaUsers } from "react-icons/fa";

const stats = [
  { icon: <FaSchool />, value: "500+", label: "Government Schools", iconBg: "bg-blue-50", iconText: "text-blue-600" },
  { icon: <FaDonate />, value: "₹50L+", label: "Donations Raised", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  { icon: <FaHandsHelping />, value: "150+", label: "NGO Partners", iconBg: "bg-blue-50", iconText: "text-blue-500" },
  { icon: <FaUsers />, value: "20K+", label: "Students Benefited", iconBg: "bg-emerald-50", iconText: "text-emerald-500" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-slate-50 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className={`w-12 h-12 ${stat.iconBg} ${stat.iconText} rounded-xl flex items-center justify-center text-xl mx-auto mb-4`}>
                {stat.icon}
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{stat.value}</h2>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
