/* Reusable Badge component */
const variants = {
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  slate: "bg-slate-100 text-slate-700",
  purple: "bg-purple-100 text-purple-700",
};

const Badge = ({ children, variant = "blue", className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${variants[variant] || variants.blue} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
