/* Reusable Select component */
const Select = ({ label, id, options = [], error, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full rounded-xl border px-4 py-3 text-sm text-slate-800
          outline-none transition-all duration-200 bg-gray-50
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-400" : "border-gray-200 hover:border-blue-300"}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
