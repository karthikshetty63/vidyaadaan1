import React from "react";

const Card = ({ children, className = "", variant = "default", hover = true }) => {
  const variants = {
    default:
      "bg-white border border-slate-100 shadow-xl shadow-blue-950/5 rounded-[24px]",
    glass:
      "bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl rounded-[24px]",
    elevated:
      "bg-white border border-slate-100 shadow-2xl shadow-blue-950/10 rounded-[24px]",
  };

  const hoverEffect = hover
    ? "card-hover"
    : "";

  return (
    <div className={`${variants[variant] || variants.default} ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
