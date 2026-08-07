import React, { useState } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import { NOTIFICATIONS_LIST, INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

const Notifications = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_LIST);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="school" userName={profile.name} userSub={profile.district} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar role="school" title="Notifications Activity Center" subtitle={profile.name} notifications={[1, 2]} />

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1 border border-blue-200">
                <span>🔔</span> Activity Center
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">Notifications & System Activity Log</h1>
              <p className="text-xs text-slate-500">Real-time alerts for NGO approvals, donor contributions, and project milestone events.</p>
            </div>

            <button
              onClick={markAllRead}
              className="h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-full transition-colors"
            >
              ✓ Mark All as Read
            </button>
          </div>

          {/* Feed List */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-2">
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl flex items-start gap-4 transition-colors ${
                    !n.read ? "bg-blue-50/50" : "hover:bg-slate-50/60"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                    {n.icon}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-slate-900">{n.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Notifications;
