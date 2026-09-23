import { Link } from "react-router-dom";
import { LuBell, LuMenu } from "react-icons/lu";

// Only portals that actually have a notifications page show the bell.
const NOTIFICATION_PAGES = { school: "/dashboard/school/notifications" };

const DashboardNavbar = ({ role = "school", title = "Dashboard", subtitle = "", notifications = [], onMenuClick, menuOpen = false }) => {
  const notificationsHref = NOTIFICATION_PAGES[role];
  const unread = notifications.length;

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6 bg-white border-b border-slate-200">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        aria-controls="dashboard-mobile-nav"
        aria-expanded={menuOpen}
        className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      >
        <LuMenu className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
        {subtitle && <p className="hidden sm:block text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {notificationsHref && (
        <Link
          to={notificationsHref}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        >
          <LuBell className="w-5 h-5" aria-hidden="true" />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden="true" />}
        </Link>
      )}
    </header>
  );
};

export default DashboardNavbar;
