import { useState } from "react";
import { LuCheck } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import { NOTIFICATIONS_LIST, INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

const Notifications = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_LIST);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout
      role="school"
      userName={profile.name}
      userSub={profile.district}
      title="Notifications"
      subtitle={profile.name}
      notifications={notifications.filter((n) => !n.read)}
    >
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            title="Notifications"
            description="NGO approvals, donor contributions and project milestones."
            actions={
              <Button variant="secondary" icon={LuCheck} onClick={markAllRead} disabled={!unreadCount}>
                Mark all as read
              </Button>
            }
          />

          <Card className="overflow-hidden">
            {notifications.length === 0 ? (
              <EmptyState title="No notifications" />
            ) : (
              <ul className="divide-y divide-slate-200">
                {notifications.map((n) => (
                  <li key={n.id} className={`flex gap-3 px-5 py-4 ${n.read ? "" : "bg-blue-50/40"}`}>
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? "bg-slate-300" : "bg-blue-600"}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                        <p className={`text-sm ${n.read ? "text-slate-700" : "font-medium text-slate-900"}`}>
                          {n.title}
                          {!n.read && <span className="sr-only"> (unread)</span>}
                        </p>
                        <time className="text-xs text-slate-500">{n.time}</time>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{n.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Notifications;
