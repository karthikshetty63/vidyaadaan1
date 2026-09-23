import { LuInbox } from "react-icons/lu";

const EmptyState = ({ icon: Icon = LuInbox, title, description, action, className = "" }) => (
  <div className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}>
    <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
      <Icon className="w-5 h-5 text-slate-500" aria-hidden="true" />
    </span>
    <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
    {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
