/* Reusable Button component with variant support */
const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
  secondary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
  outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  ghost: "text-blue-600 hover:bg-blue-50",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  white: "bg-white text-blue-700 hover:bg-blue-50",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
