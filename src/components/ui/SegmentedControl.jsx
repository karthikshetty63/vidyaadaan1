/**
 * Single-choice segmented buttons, used for filters and small option sets.
 * options: [{ value, label, count? }]
 */
const SegmentedControl = ({ label, options, value, onChange, className = "" }) => (
  <div role="group" aria-label={label} className={`inline-flex max-w-full overflow-x-auto rounded-control border border-slate-300 bg-white p-0.5 shadow-xs ${className}`}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(option.value)}
          className={`h-8 px-3 rounded-lg text-sm whitespace-nowrap transition-colors ${
            selected ? "bg-slate-900 text-white font-medium" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={`ml-1.5 text-xs ${selected ? "text-slate-300" : "text-slate-500"}`}>{option.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
