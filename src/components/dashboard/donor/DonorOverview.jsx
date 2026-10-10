import { Link } from "react-router-dom";
import {
  LuBadgeCheck, LuBell, LuCalendarDays, LuCircleCheck, LuCircleUserRound, LuClipboardList, LuHandCoins, LuHeart, LuLock, LuMapPin, LuSchool, LuSettings,
} from "react-icons/lu";
import { HeroFact, HeroIconTile, MetricCard, PortalHero, QuickActions, RingCard } from "../PortalWidgets";
import NeedCard from "../NeedCard";
import Alert from "../../ui/Alert";
import Card, { CardHeader } from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import { buttonClasses } from "../../ui/classes";
import { formatINR } from "../../../utils/format";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// What happens to a donation, as the server actually handles it (see donationController).
const HOW_DONATIONS_WORK = [
  { icon: LuBadgeCheck, title: "Only approved needs", text: "Every need here was checked and approved by the VIDYADAAN team before it was listed." },
  { icon: LuLock, title: "Secure payment", text: "Razorpay handles the payment. VIDYADAAN never sees or stores your card, UPI or bank details." },
  { icon: LuCircleCheck, title: "Counted once confirmed", text: "A need's funding goes up only after Razorpay confirms your payment, and only once." },
];

/**
 * The donor portal's home: the donor's own giving, how far the approved needs are funded, and the needs
 * closest to their goal. Every figure is counted from approved needs and the donor's confirmed donations.
 */
const DonorOverview = ({ user, profile, profileLoading, needs, needsLoading, needsError, onRetry, donations, donationsLoading, upcomingEvents, eventsLoading, notice, onDonate, onDetails }) => {
  const open = needs.filter((n) => n.raised < n.budget);
  const openSchools = new Set(open.map((n) => `${n.school.name}|${n.school.district}|${n.school.state}`)).size;
  const raised = needs.reduce((sum, n) => sum + n.raised, 0);
  const target = needs.reduce((sum, n) => sum + n.budget, 0);
  const given = donations.reduce((sum, d) => sum + d.amount, 0);
  const supported = new Set(donations.map((d) => d.project.id)).size;
  const supportedSchools = new Set(donations.map((d) => d.school.name)).size;
  const ready = !needsLoading && !needsError;
  const shown = (value) => (needsError ? "—" : value);
  // The open needs nearest their goal, where a donation finishes the job soonest.
  const closest = [...open].sort((a, b) => b.raised / b.budget - a.raised / a.budget).slice(0, 3);
  const place = [profile?.city, profile?.state].filter(Boolean).join(", ");

  let summary = "Give to verified needs in government schools and follow how close each one is to its goal.";
  if (ready && open.length) {
    summary = `${plural(open.length, "approved need", "approved needs")} in ${plural(openSchools, "government school", "government schools")} ${open.length === 1 ? "is" : "are"} waiting for support.`;
  } else if (ready) summary = "No school needs are open right now. New ones appear here as soon as the VIDYADAAN team approves them.";

  const quickActions = [
    { icon: LuClipboardList, label: "Browse school needs", desc: "Approved needs you can give to", to: "#needs" },
    { icon: LuHandCoins, label: "My donations", desc: "Receipts and your report", to: "#donations" },
    { icon: LuCalendarDays, label: "School events", desc: "Offer help for upcoming events", to: "#events" },
    { icon: LuBell, label: "Notifications", desc: "Confirmations and schools' answers", to: "#notifications" },
    { icon: LuCircleUserRound, label: "Profile", desc: "Your contact details and preferences", to: "#profile" },
    { icon: LuSettings, label: "Settings", desc: "Password and sign out", to: "#settings" },
  ];

  return (
    <>
      <PortalHero
        userName={user?.name}
        title={user?.name}
        fallbackTitle="Welcome"
        loading={profileLoading}
        summary={summary}
        tile={<HeroIconTile><LuHeart className="h-7 w-7" aria-hidden="true" /></HeroIconTile>}
        facts={
          <>
            {/* Only accounts the admin has approved can sign in, so this is always true here. */}
            <HeroFact icon={LuCircleCheck}>Verified donor</HeroFact>
            {place && <HeroFact icon={LuMapPin}>{place}</HeroFact>}
            {profile?.causes?.length > 0 && <HeroFact>Cares about: {profile.causes.join(", ")}</HeroFact>}
            {donations.length > 0 && <HeroFact icon={LuSchool} to="#donations">{plural(supportedSchools, "school", "schools")} supported</HeroFact>}
          </>
        }
        actions={
          <>
            <Link to="#donations" className={buttonClasses({ variant: "secondary" })}>
              <LuHandCoins className="h-4 w-4" aria-hidden="true" /> My donations
            </Link>
            <Link to="#needs" className={buttonClasses()}>
              <LuClipboardList className="h-4 w-4" aria-hidden="true" /> School needs
            </Link>
          </>
        }
      />
      {notice}
      {needsError && (
        <Alert tone="danger">
          {needsError} <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      {/* The main figure gets the most room; the others sit beside it. */}
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">Overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <RingCard
            id="needs-funding"
            className="col-span-2 lg:row-span-2"
            icon={LuHandCoins}
            title="School needs funding"
            subtitle="Across all approved needs, from NGOs and donors"
            link={{ to: "#needs", label: "Browse needs" }}
            loading={needsLoading}
            loadingLabel="Loading school needs…"
            failed={Boolean(needsError)}
            failedText="School needs can’t be shown right now. Try reloading the page."
            value={raised}
            goal={target}
            centerLabel="funded"
            srText={(percent) => `${formatINR(raised)} raised of ${formatINR(target)}, ${percent}% funded.`}
            facts={[
              { label: "Raised", value: formatINR(raised), tone: "text-emerald-700" },
              { label: "Goal", value: formatINR(target) },
              { label: "Still needed", value: formatINR(Math.max(target - raised, 0)) },
              { label: "You've given", value: formatINR(given), tone: "text-primary-700", loading: donationsLoading },
            ]}
            empty={{ title: "No approved needs yet", text: "When the VIDYADAAN team approves a school's request, it appears here and you can give to it." }}
          />
          <MetricCard label="You've given" value={formatINR(given)} icon={LuHandCoins} tone="green" loading={donationsLoading} hint={donations.length ? `In ${plural(donations.length, "donation", "donations")}` : "Confirmed by Razorpay"} to="#donations" />
          <MetricCard label="Needs you've supported" value={supported} icon={LuHeart} tone="blue" loading={donationsLoading} hint={supported ? `In ${plural(supportedSchools, "school", "schools")}` : "Your first is one click away"} />
          <MetricCard label="Open school needs" value={shown(open.length)} icon={LuClipboardList} tone="amber" loading={needsLoading} hint={ready && open.length ? `In ${plural(openSchools, "school", "schools")}` : "Approved by the VIDYADAAN team"} to="#needs" />
          <MetricCard label="Upcoming school events" value={upcomingEvents} icon={LuCalendarDays} tone="blue" loading={eventsLoading} hint="Offer help for one" to="#events" />
        </div>
      </section>

      <QuickActions actions={quickActions} />

      <section aria-labelledby="closest-heading" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="closest-heading" className="text-[15px] font-bold tracking-tight text-slate-900">Closest to their goal</h2>
            <p className="text-xs text-slate-500">Open needs where a donation finishes the job soonest.</p>
          </div>
          {open.length > 0 && <Link to="#needs" className="shrink-0 whitespace-nowrap rounded-md text-sm font-medium text-primary-700 hover:underline">View all {open.length}</Link>}
        </div>
        {needsLoading && <Card><p className="px-5 py-8 text-center text-sm text-slate-500" role="status">Loading school needs…</p></Card>}
        {ready && closest.length === 0 && (
          <Card>
            <EmptyState icon={LuClipboardList} title="No open school needs right now" description="When the VIDYADAAN team approves a school's request, it will appear here." className="py-8" />
          </Card>
        )}
        {closest.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {closest.map((need) => <NeedCard key={need.id} need={need} onDonate={onDonate} onDetails={onDetails} />)}
          </div>
        )}
      </section>

      <Card as="section" aria-labelledby="how-heading">
        <CardHeader title={<span id="how-heading">How your donation is handled</span>} />
        <ul className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          {HOW_DONATIONS_WORK.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-sm text-slate-600">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
};

export default DonorOverview;
