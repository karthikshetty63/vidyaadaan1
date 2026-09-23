/** Funding / completion bar. Turns green when complete. */
const ProgressBar = ({ value = 0, label, className = "" }) => {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 w-full rounded-full bg-slate-100 overflow-hidden ${className}`}
    >
      <div className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

export default ProgressBar;
