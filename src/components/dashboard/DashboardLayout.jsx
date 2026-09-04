import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";

const DashboardLayout = ({
    role = "school",
    userName = "Admin",
    userSub = "",
    title = "Dashboard",
    subtitle = "",
    notifications = [],
    backgroundClass = "bg-slate-50",
    children,
}) => (
    <div className={`flex h-screen ${backgroundClass} overflow-hidden font-sans`}>
        <Sidebar role={role} userName={userName} userSub={userSub} />

        <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardNavbar
                role={role}
                title={title}
                subtitle={subtitle}
                notifications={notifications}
            />
            {children}
        </div>
    </div>
);

export default DashboardLayout;
