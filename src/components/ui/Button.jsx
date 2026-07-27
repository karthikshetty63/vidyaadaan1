import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  onClick,
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white shadow-lg shadow-sky-500/25 focus:ring-sky-500 active:scale-[0.98]",
    secondary:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/25 focus:ring-orange-500 active:scale-[0.98]",
    accent:
      "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500 active:scale-[0.98]",
    outline:
      "border-2 border-slate-300 hover:border-sky-600 text-slate-700 hover:text-sky-600 bg-white hover:bg-sky-50 focus:ring-sky-500",
    ghost:
      "text-slate-600 hover:text-sky-600 hover:bg-slate-100/80 focus:ring-sky-500",
    white:
      "bg-white text-slate-900 hover:bg-slate-50 shadow-md hover:shadow-lg focus:ring-white active:scale-[0.98]"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
    xl: "px-8 py-4 text-lg gap-3"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${widthStyle} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
