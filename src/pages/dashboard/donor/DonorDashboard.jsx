import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import AccountSettingsView from "../../../components/dashboard/account/AccountSettingsView";
import NotificationsView from "../../../components/dashboard/account/NotificationsView";
import PartnerProfileView from "../../../components/dashboard/account/PartnerProfileView";
import DonorDonationsView from "../../../components/dashboard/donor/DonorDonationsView";
import DonorNeedDetailsModal from "../../../components/dashboard/donor/DonorNeedDetailsModal";
import DonorNeedsView from "../../../components/dashboard/donor/DonorNeedsView";
import DonorOverview from "../../../components/dashboard/donor/DonorOverview";
import SupporterEvents from "../../../components/events/SupporterEvents";
import PaymentFlowModal from "../../../components/payment/PaymentFlowModal";
import Alert from "../../../components/ui/Alert";
import { useAuth } from "../../../context/AuthContext";
import useApprovedProjects from "../../../hooks/useApprovedProjects";
import useMyDonations from "../../../hooks/useMyDonations";
import useMyProfile from "../../../hooks/useMyProfile";
import useSupporterEvents from "../../../hooks/useSupporterEvents";

// Each sidebar item opens its own view of the portal, like a separate page. The URL hash (#needs,
// #donations…) says which, so a view can be bookmarked and the back button moves between views.
const VIEWS = {
  overview: "Dashboard",
  needs: "School needs",
  donations: "My donations",
  events: "School events",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
};

/* ─── DONOR DASHBOARD ─────────────────────────────────────── */
const DonorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requested = location.hash.slice(1);
  const view = Object.hasOwn(VIEWS, requested) ? requested : "overview";

  const { user, logout } = useAuth();
  const { profile, loading: profileLoading, error: profileError, setProfile, reload: reloadProfile } = useMyProfile();
  // Approved school needs from the server (the donor view).
  const { projects: needs, loading: needsLoading, error: needsError, reload: reloadNeeds, refresh: refreshNeeds } = useApprovedProjects();
  // The donor's own confirmed donations ("My donations", the report card and the figures).
  const myDonations = useMyDonations();
  const donations = myDonations.donations;
  const eventList = useSupporterEvents();

  // The need being donated to, and the one being read. After a confirmed donation the figures reload.
  const [donatingTo, setDonatingTo] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  // A success message for the view it happened on; it disappears once you move to another view.
  const [notice, setNotice] = useState(null); // { key: location.key, message }
  const say = (message) => setNotice({ key: location.key, message });
  const noticeHere = notice?.key === location.key && <Alert tone="success">{notice.message}</Alert>;

  // A new view starts at the top, and focus moves to its heading, as it would on a new page.
  const mainRef = useRef(null);
  const viewRef = useRef(null);
  const shownView = useRef(view);
  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    mainRef.current?.scrollTo({ top: 0 });
    const heading = viewRef.current?.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [view]);

  const afterDonation = () => {
    refreshNeeds();
    myDonations.refresh();
  };
  const donate = (need) => {
    setViewing(null);
    setDonatingTo(need);
  };
  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } catch {
      // AuthContext already cleared the local user; still leave the dashboard.
    }
    navigate("/login/donor", { replace: true });
  };

  const content = {
    overview: (
      <DonorOverview
        user={user}
        profile={profile}
        profileLoading={profileLoading}
        needs={needs}
        needsLoading={needsLoading}
        needsError={needsError}
        onRetry={reloadNeeds}
        donations={donations}
        donationsLoading={myDonations.loading}
        upcomingEvents={eventList.error ? "—" : eventList.open.length}
        eventsLoading={eventList.loading}
        notice={noticeHere}
        onDonate={donate}
        onDetails={setViewing}
      />
    ),
    needs: <DonorNeedsView needs={needs} loading={needsLoading} error={needsError} onRetry={reloadNeeds} notice={noticeHere} onDonate={donate} onDetails={setViewing} />,
    donations: <DonorDonationsView user={user} donations={donations} loading={myDonations.loading} error={myDonations.error} onRetry={myDonations.reload} notice={noticeHere} />,
    events: (
      <SupporterEvents
        role="donor"
        open={eventList.open}
        mine={eventList.mine}
        loading={eventList.loading}
        error={eventList.error}
        onRetry={eventList.reload}
        onChanged={async (message) => {
          await eventList.refresh();
          say(message);
        }}
        notice={noticeHere}
      />
    ),
    notifications: (
      <NotificationsView
        canHaveActions={false}
        description="Your confirmed donations, and schools' answers to your offers of help."
        emptyText="Nothing has happened yet. When a donation is confirmed or a school answers an offer, it shows here."
      />
    ),
    profile: (
      <PartnerProfileView
        role="donor"
        profile={profile}
        loading={profileLoading}
        error={profileError}
        onRetry={reloadProfile}
        notice={noticeHere}
        onSaved={(saved) => {
          setProfile(saved);
          say("Your profile has been updated.");
        }}
      />
    ),
    settings: <AccountSettingsView accountType="Donor" onSignOut={signOut} signingOut={signingOut} />,
  }[view];

  return (
    <DashboardLayout role="donor" userName={user?.name || "Donor"} userSub={user?.email || "Individual donor"} title={VIEWS[view]} subtitle={`Signed in as ${user?.email || "donor"}`}>
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        {/* The fade-in moves only the inner box, so the view's own top edge (which the sidebar scrolls to) stays put. */}
        <div key={view} ref={viewRef} id={view} className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 animate-view-enter motion-reduce:animate-none">{content}</div>
        </div>
      </main>

      {viewing && <DonorNeedDetailsModal need={viewing} onClose={() => setViewing(null)} onDonate={donate} />}
      {/* After a confirmed donation the needs and "My donations" reload from the server; when the need has changed, the needs do. */}
      {donatingTo && <PaymentFlowModal need={donatingTo} onClose={() => setDonatingTo(null)} onConfirmed={afterDonation} onNeedChanged={refreshNeeds} />}
    </DashboardLayout>
  );
};

export default DonorDashboard;
