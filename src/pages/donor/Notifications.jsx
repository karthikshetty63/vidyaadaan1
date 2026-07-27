import { useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { FaCheckCircle, FaDonate, FaSchool, FaBell, FaHeart } from "react-icons/fa";

const initialNotifications = [
  { id: 1, icon: FaCheckCircle, title: "Project Completed!", message: "Classroom Roof Repair at Govt. Higher Primary School has been completed. View the impact report.", time: "2 hours ago", read: false, type: "emerald" },
  { id: 2, icon: FaDonate, title: "Donation Confirmed", message: "Your donation of ₹40,000 to Digital Library Setup has been received and is being processed.", time: "1 day ago", read: false, type: "blue" },
  { id: 3, icon: FaSchool, title: "New School Added", message: "Govt. High School, Dharwad has joined VIDYADAAN and needs support for lab equipment.", time: "2 days ago", read: false, type: "blue" },
  { id: 4, icon: FaHeart, title: "Impact Update", message: "Your donations have benefited 1,200+ students across 4 schools this year. Thank you!", time: "4 days ago", read: true, type: "emerald" },
  { id: 5, icon: FaDonate, title: "Donation Receipt", message: "Receipt VD-2024-098 for ₹10,000 to Library Books project is ready to download.", time: "1 week ago", read: true, type: "blue" },
  { id: 6, icon: FaBell, title: "Funding Milestone", message: "Digital Library Setup at Govt. High School, Madikeri has reached 50% of its funding goal!", time: "1 week ago", read: true, type: "blue" },
];

const iconBg = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

const DonorNotifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            Stay updated on your donations and school activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="blue">{unreadCount} New</Badge>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(({ id, icon: Icon, title, message, time, read, type }) => (
          <Card
            key={id}
            className={`p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
              !read ? "border-l-4 border-l-blue-500" : ""
            }`}
            onClick={() => markRead(id)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg[type]}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${read ? "text-slate-600" : "text-slate-800"}`}>
                    {title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-0.5 leading-5">{message}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DonorNotifications;
