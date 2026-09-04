import React from "react";

const Badge = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-sky-100 text-sky-700",
    secondary: "bg-amber-100 text-amber-700",
    accent: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
    warning: "bg-orange-100 text-orange-700",
    completed: "bg-emerald-100 text-emerald-700",
    active: "bg-sky-100 text-sky-700",
    "nearly funded": "bg-amber-100 text-amber-700",
  };

  const lower = (children?.toString() || "").toLowerCase();
  const resolvedVariant = variants[lower] || variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${resolvedVariant} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
