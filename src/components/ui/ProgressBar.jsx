import React, { useEffect, useRef, useState } from "react";

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  height = "md",
  color = "primary",
  animated = true,
  className = "",
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  const heights = {
    xs: "h-1.5",
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const colors = {
    primary: "from-sky-500 to-blue-600",
    secondary: "from-amber-400 to-orange-500",
    accent: "from-emerald-500 to-teal-600",
    purple: "from-purple-500 to-indigo-600",
    full: "from-emerald-500 to-teal-600",
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(percentage), 100);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percentage]);

  const resolvedColor =
    percentage >= 100 ? colors.full : colors[color] || colors.primary;

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-slate-500">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-bold text-slate-700">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[height] || heights.md}`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${resolvedColor} ${
            animated ? "transition-all duration-1000 ease-out" : ""
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
