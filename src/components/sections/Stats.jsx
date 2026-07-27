import Container from "../layout/Container";
import { FaSchool, FaDonate, FaHandsHelping, FaUserGraduate } from "react-icons/fa";

const stats = [
  { id: 1, icon: FaSchool, value: "500+", label: "Government Schools", color: "text-blue-600", bg: "bg-blue-50" },
  { id: 2, icon: FaDonate, value: "₹50L+", label: "Donations Raised", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: 3, icon: FaHandsHelping, value: "150+", label: "NGO Partners", color: "text-blue-500", bg: "bg-blue-50" },
  { id: 4, icon: FaUserGraduate, value: "20,000+", label: "Students Benefited", color: "text-emerald-500", bg: "bg-emerald-50" },
];

const Stats = () => {
  return (
    <section className="py-20 bg-slate-50">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ id, icon: Icon, value, label, color, bg }) => (
            <div
              key={id}
              className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`text-2xl ${color}`} />
              </div>
              <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Stats;
