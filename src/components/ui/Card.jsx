// Standard surface: white, subtle border, very light shadow, 16px radius.
// Elevation is not used for decoration — only `interactive` cards react on hover.
const Card = ({ as: Tag = "div", className = "", interactive = false, padded = false, children, ...props }) => (
  <Tag
    className={[
      "bg-white border border-slate-200 rounded-2xl shadow-xs",
      interactive ? "transition-colors hover:border-slate-300" : "",
      padded ? "p-5" : "",
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </Tag>
);

/** Card header row: section title, optional description and actions on the right. */
export const CardHeader = ({ title, description, actions, className = "" }) => (
  <div className={`flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 ${className}`}>
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export default Card;
