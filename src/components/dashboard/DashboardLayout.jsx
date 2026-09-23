import { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";

// Shell for every dashboard page: sidebar (drawer below 1024px) + top bar + scrolling content.
// `backgroundClass` is still accepted from older pages but all dashboards now share bg-slate-50.
const DashboardLayout = ({
    role = "school",
    userName = "Admin",
    userSub = "",
    title = "Dashboard",
    subtitle = "",
    notifications = [],
    children,
}) => {
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar role={role} userName={userName} userSub={userSub} mobileOpen={navOpen} onClose={() => setNavOpen(false)} />

            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <DashboardNavbar
                    role={role}
                    title={title}
                    subtitle={subtitle}
                    notifications={notifications}
                    onMenuClick={() => setNavOpen(true)}
                    menuOpen={navOpen}
                />
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
