/* Reusable Textarea component */
const Textarea = ({ label, id, error, className = "", rows = 4, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`
          w-full rounded-xl border px-4 py-3 text-sm text-slate-800
          placeholder:text-slate-400 outline-none transition-all duration-200 resize-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-blue-300"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
