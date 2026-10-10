import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import NotificationsView from "../../../components/dashboard/account/NotificationsView";
import { useAuth } from "../../../context/AuthContext";

// What is waiting for the school (payments to check, offers to answer, changes requested) and what has
// happened (approvals, NGO commitments, donations). The server works the list out from the school's records.
const Notifications = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout role="school" userName={user?.name} userSub={user?.email} title="Notifications" subtitle="What needs you, and what's new">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <NotificationsView
            description="Payments to check, offers of help to answer and review decisions, then everything else that has happened on your projects and events."
            emptyText="Nothing has happened yet. Review decisions, NGO commitments, payments, donations and offers of help will show here."
          />
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Notifications;
