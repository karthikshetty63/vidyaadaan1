/* Reusable ProgressBar component */
const ProgressBar = ({ value = 0, color = "emerald", showLabel = true, className = "" }) => {
  const colors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${colors[color] || colors.emerald}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 mt-1">{value}% funded</p>
      )}
    </div>
  );
};

export default ProgressBar;
