import React from "react";

const Card = ({ children, className = "", variant = "default", hover = true }) => {
  const variants = {
    default:
      "bg-white border border-slate-200 shadow-sm rounded-2xl",
    glass:
      "glass-card rounded-2xl",
    elevated:
      "bg-white border border-slate-100 shadow-xl rounded-2xl",
  };

  const hoverEffect = hover
    ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out"
    : "";

  return (
    <div className={`${variants[variant] || variants.default} ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
