import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaSchool, FaProjectDiagram, FaDonate, FaImages,
  FaChartBar, FaCog, FaSignOutAlt, FaTimes, FaBell,
  FaUser, FaClipboardList, FaHandsHelping, FaUsers,
  FaBookmark, FaPlus, FaListAlt, FaBuilding,
} from "react-icons/fa";

const navConfig = {
  school: [
    { label: "Dashboard", icon: FaHome, to: "/school/dashboard" },
    { label: "Infrastructure", icon: FaBuilding, to: "/school/infrastructure" },
    { label: "Create Issue", icon: FaPlus, to: "/school/create-issue" },
    { label: "Manage Issues", icon: FaListAlt, to: "/school/manage-issues" },
    { label: "Donation History", icon: FaDonate, to: "/school/donation-history" },
    { label: "Gallery", icon: FaImages, to: "/school/gallery" },
    { label: "Reports", icon: FaChartBar, to: "/school/reports" },
    { label: "Notifications", icon: FaBell, to: "/school/notifications" },
    { label: "Profile", icon: FaUser, to: "/school/profile" },
    { label: "Settings", icon: FaCog, to: "/school/settings" },
  ],
  donor: [
    { label: "Dashboard", icon: FaHome, to: "/donor/dashboard" },
    { label: "Browse Schools", icon: FaSchool, to: "/donor/browse" },
    { label: "Donation History", icon: FaDonate, to: "/donor/donation-history" },
    { label: "Saved Projects", icon: FaBookmark, to: "/donor/saved" },
    { label: "Notifications", icon: FaBell, to: "/donor/notifications" },
    { label: "Profile", icon: FaUser, to: "/donor/profile" },
  ],
  ngo: [
    { label: "Dashboard", icon: FaHome, to: "/ngo/dashboard" },
    { label: "Manage Schools", icon: FaSchool, to: "/ngo/schools" },
    { label: "Projects", icon: FaProjectDiagram, to: "/ngo/projects" },
    { label: "Volunteers", icon: FaUsers, to: "/ngo/volunteers" },
    { label: "Reports", icon: FaChartBar, to: "/ngo/reports" },
    { label: "Notifications", icon: FaBell, to: "/ngo/notifications" },
    { label: "Profile", icon: FaUser, to: "/ngo/profile" },
  ],
  admin: [
    { label: "Dashboard", icon: FaHome, to: "/admin/dashboard" },
    { label: "Schools", icon: FaSchool, to: "/admin/schools" },
    { label: "Donations", icon: FaDonate, to: "/admin/donations" },
    { label: "NGOs", icon: FaHandsHelping, to: "/admin/ngos" },
    { label: "Users", icon: FaUsers, to: "/admin/users" },
    { label: "Analytics", icon: FaChartBar, to: "/admin/analytics" },
    { label: "Reports", icon: FaClipboardList, to: "/admin/reports" },
    { label: "Settings", icon: FaCog, to: "/admin/settings" },
  ],
};

const roleLabels = {
  school: "School Portal",
  donor: "Donor Portal",
  ngo: "NGO Portal",
  admin: "Admin Panel",
};

const Sidebar = ({ role = "school", sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const menuItems = navConfig[role] || navConfig.school;

  const handleLogout = () => {
    navigate("/join");
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white
          flex flex-col transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/60">
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              VIDYADAAN
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{roleLabels[role]}</p>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white transition"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-700/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <FaSignOutAlt size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
