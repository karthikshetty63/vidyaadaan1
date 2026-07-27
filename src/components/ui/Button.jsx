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
    "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-xl shadow-blue-600/20 focus:ring-blue-500",
    secondary:
      "bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 shadow-xs focus:ring-emerald-500",
    accent:
      "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 bg-white",
    ghost:
      "text-slate-600 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    white:
      "bg-white text-slate-900 hover:bg-slate-50 shadow-md hover:shadow-lg focus:ring-white",
  };

  const sizes = {
    sm: "h-10 px-5 text-xs gap-1.5",
    md: "h-12 px-6 text-xs gap-2",
    lg: "h-14 px-8 text-sm gap-2.5",
    xl: "h-16 px-10 text-base gap-3",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.lg
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
