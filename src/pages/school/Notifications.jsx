import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { FaBell, FaCheckCircle, FaDonate, FaHandsHelping } from "react-icons/fa";

const notifications = [
  { id: 1, icon: FaDonate, title: "New Donation Received", message: "Priya Sharma donated ₹25,000 to Classroom Roof Repair.", time: "2 hours ago", read: false, type: "blue" },
  { id: 2, icon: FaHandsHelping, title: "NGO Verified Your Issue", message: "Pratham NGO has verified your 'Library Books' request.", time: "1 day ago", read: false, type: "emerald" },
  { id: 3, icon: FaCheckCircle, title: "Project Completed", message: "Digital Blackboard project has been marked as completed.", time: "3 days ago", read: true, type: "emerald" },
  { id: 4, icon: FaDonate, title: "New Donation Received", message: "Suresh Kumar donated ₹40,000 to Digital Blackboard.", time: "5 days ago", read: true, type: "blue" },
  { id: 5, icon: FaBell, title: "Profile Update Reminder", message: "Please update your school profile to improve visibility.", time: "1 week ago", read: true, type: "slate" },
];

const iconBg = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", slate: "bg-slate-100 text-slate-600" };

const SchoolNotifications = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated on donations and project activity</p>
        </div>
        <Badge variant="blue">{notifications.filter((n) => !n.read).length} New</Badge>
      </div>

      <div className="space-y-3">
        {notifications.map(({ id, icon: Icon, title, message, time, read, type }) => (
          <Card key={id} className={`p-5 ${!read ? "border-l-4 border-l-blue-500" : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg[type]}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold ${read ? "text-slate-600" : "text-slate-800"}`}>{title}</p>
                  {!read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{message}</p>
                <p className="text-xs text-slate-400 mt-1">{time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchoolNotifications;
