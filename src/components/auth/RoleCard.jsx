import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const themes = {
  blue: {
    border: "hover:border-blue-500",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    loginBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    registerBtn: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  },
  emerald: {
    border: "hover:border-emerald-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    loginBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    registerBtn: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50",
  },
  slate: {
    border: "hover:border-slate-500",
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
    loginBtn: "bg-slate-700 hover:bg-slate-800 text-white",
    registerBtn: "border-2 border-slate-600 text-slate-600 hover:bg-slate-50",
  },
};

const RoleCard = ({ icon, title, description, features = [], loginTo, registerTo, color = "blue" }) => {
  const theme = themes[color] || themes.blue;

  return (
    <div
      className={`bg-white rounded-3xl shadow-lg border-2 border-transparent ${theme.border}
        transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl p-8 flex flex-col`}
    >
      {/* Icon */}
      <div className={`w-16 h-16 ${theme.iconBg} rounded-2xl flex items-center justify-center mb-5`}>
        <span className={`text-3xl ${theme.iconText}`}>{icon}</span>
      </div>

      {/* Title & Description */}
      <h2 className="text-2xl font-bold text-slate-800 mb-3">{title}</h2>
      <p className="text-slate-500 leading-relaxed mb-5 text-sm">{description}</p>

      {/* Features */}
      {features.length > 0 && (
        <ul className="mb-6 flex flex-col gap-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Buttons */}
      <div className="mt-auto flex flex-col gap-3">
        <Link
          to={loginTo}
          className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold transition-colors duration-200 text-sm ${theme.loginBtn}`}
        >
          Login <FaArrowRight size={12} />
        </Link>
        <Link
          to={registerTo}
          className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold transition-colors duration-200 text-sm ${theme.registerBtn}`}
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default RoleCard;
