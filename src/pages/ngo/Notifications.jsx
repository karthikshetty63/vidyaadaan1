import { useState } from "react";
import { FaBell, FaProjectDiagram, FaUsers, FaRupeeSign, FaCheckCircle, FaSchool, FaCalendarAlt } from "react-icons/fa";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const initialNotifications = [
  { id: 1, type: "project", title: "New Project Assigned", message: "Playground Equipment project at GPS Indiranagar has been assigned to your NGO.", time: "2 hours ago", read: false },
  { id: 2, type: "donation", title: "Donation Received", message: "₹25,000 donation received for Computer Lab Setup at ZPS Whitefield.", time: "5 hours ago", read: false },
  { id: 3, type: "volunteer", title: "New Volunteer Joined", message: "Kiran Patil has joined as a Field Coordinator volunteer.", time: "1 day ago", read: false },
  { id: 4, type: "milestone", title: "Project Milestone Reached", message: "Toilet Block Construction at GPS Yelahanka is 88% complete.", time: "2 days ago", read: true },
  { id: 5, type: "visit", title: "Site Visit Scheduled", message: "School visit scheduled at ZPS Whitefield on 28 Nov 2025.", time: "3 days ago", read: true },
  { id: 6, type: "project", title: "Project Completed", message: "Classroom Renovation at ZPS Doddaballapur has been marked as completed.", time: "5 days ago", read: true },
  { id: 7, type: "donation", title: "Donation Received", message: "₹50,000 donation received for Library Renovation at GPS Koramangala.", time: "1 week ago", read: true },
  { id: 8, type: "volunteer", title: "Volunteer Update", message: "Sneha Kulkarni has been marked inactive due to inactivity.", time: "1 week ago", read: true },
];

const typeConfig = {
  project: { icon: FaProjectDiagram, color: "text-blue-600", bg: "bg-blue-100", badge: "blue" },
  donation: { icon: FaRupeeSign, color: "text-emerald-600", bg: "bg-emerald-100", badge: "emerald" },
  volunteer: { icon: FaUsers, color: "text-purple-600", bg: "bg-purple-100", badge: "purple" },
  milestone: { icon: FaCheckCircle, color: "text-green-600", bg: "bg-green-100", badge: "green" },
  visit: { icon: FaCalendarAlt, color: "text-blue-500", bg: "bg-blue-50", badge: "blue" },
};

const NGONotifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const filtered = notifications.filter((n) => {
    if (filter === "Unread") return !n.read;
    if (filter === "Read") return n.read;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <FaCheckCircle size={13} /> Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["All", "Unread", "Read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {f}
            {f === "Unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FaBell size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No notifications</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const config = typeConfig[n.type] || typeConfig.project;
            const Icon = config.icon;
            return (
              <Card
                key={n.id}
                className={`p-4 cursor-pointer transition-all ${!n.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
                onClick={() => markRead(n.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${!n.read ? "text-slate-900" : "text-slate-700"}`}>{n.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1" />}
                        <Badge variant={config.badge} className="capitalize">{n.type}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{n.time}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NGONotifications;
