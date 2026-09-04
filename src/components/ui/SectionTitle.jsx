import React from "react";

const SectionTitle = ({
  pill,
  title,
  highlight,
  subtitle,
  align = "center",
  highlightColor = "text-sky-600",
  className = "",
}) => {
  const alignments = {
    center: "text-center mx-auto",
    left: "text-left",
    right: "text-right ml-auto",
  };

  return (
    <div className={`max-w-2xl ${alignments[align] || alignments.center} ${className}`}>
      {pill && (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold tracking-wider uppercase mb-4">
          {pill}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight text-slate-900 mb-4">
        {title}{" "}
        {highlight && <span className={`${highlightColor}`}>{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
