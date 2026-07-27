import { FaBars, FaBell, FaSearch, FaUserCircle, FaChevronDown } from "react-icons/fa";

const roleUsers = {
  school: { name: "Ramesh Nair", sub: "School Principal" },
  donor: { name: "Priya Sharma", sub: "Donor" },
  ngo: { name: "Anita Desai", sub: "NGO Coordinator" },
  admin: { name: "Admin User", sub: "Super Admin" },
};

const TopNavbar = ({ role = "school", setSidebarOpen }) => {
  const user = roleUsers[role] || roleUsers.school;

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-5 shrink-0">

      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-xl text-slate-600 hover:text-blue-600 transition"
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>

        <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-72 gap-2">
          <FaSearch className="text-slate-400 text-sm shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <div className="relative cursor-pointer">
          <FaBell className="text-xl text-slate-500 hover:text-blue-600 transition" />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            3
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <FaUserCircle className="text-3xl text-blue-500" />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-xs text-slate-400">{user.sub}</p>
          </div>
          <FaChevronDown className="text-xs text-slate-400 group-hover:text-blue-500 transition" />
        </div>

      </div>
    </header>
  );
};

export default TopNavbar;
