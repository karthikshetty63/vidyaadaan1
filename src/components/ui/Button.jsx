import { LuLoaderCircle } from "react-icons/lu";
import { buttonClasses } from "./classes";

// Variants: primary | secondary | destructive | ghost (see classes.js). Sizes: sm | md | lg.
// Use buttonClasses() from ./classes for links that should look like buttons.
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  loading = false,
  type = "button",
  disabled = false,
  ...props
}) => (
  <button
    type={type}
    className={buttonClasses({ variant, size: size === "xl" ? "lg" : size, fullWidth, className })}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? (
      <LuLoaderCircle className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
    ) : (
      Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
    )}
    <span>{children}</span>
    {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
  </button>
);

export default Button;
