import { Link } from "react-router-dom";
import {
  LuCalendarDays, LuCircleCheck, LuClipboardList, LuFileChartColumn, LuFolderKanban, LuGraduationCap, LuHeartHandshake, LuIndianRupee, LuMapPin,
  LuUsers, LuWallet,
} from "react-icons/lu";
import {
  HeroFact, HeroIconTile, MetricCard, PortalHero, QuickActions, ROW, RingCard, RowArrow, RowSkeletons, WaitingLink,
} from "../PortalWidgets";
import Alert from "../../ui/Alert";
import Badge from "../../ui/Badge";
import Card, { CardHeader } from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import { buttonClasses } from "../../ui/classes";
import { formatINR, freeParts, fundingStatus, myParts, schoolPlace, sumAmounts } from "./format";

const PREVIEW_ROWS = 4;

const ViewAll = ({ to, children = "View all" }) => (
  <Link to={to} className="rounded-md text-sm font-medium text-primary-700 hover:underline">{children}</Link>
);

/**
 * The NGO portal's home: who the NGO is, where its own funding stands, and what is open to support.
 * Every figure is counted from approved needs, the NGO's own commitments and approved events.
 */
const OverviewView = ({ profile, profileLoading, userName, needs, needsLoading, funded, fundedLoading, loadError, upcomingEvents, eventsLoading, notice, onRetry, onViewNeed }) => {
  const ngoName = profile?.ngoName || "";
  const place = [profile?.district, profile?.state].filter(Boolean).join(", ");
  const focus = profile?.focus || [];

  const openNeeds = needs.filter((n) => freeParts(n).length > 0);
  const openSchools = new Set(openNeeds.map((n) => `${n.school.name}|${n.school.district}|${n.school.state}`));
  const stillNeeded = needs.reduce((sum, n) => sum + sumAmounts(freeParts(n)), 0);
  // The NGO's own parts, by where their money stands.
  const mine = funded.flatMap((n) => myParts(n));
  const amountOf = (status) => sumAmounts(mine.filter((p) => p.status === status));
  const committed = sumAmounts(mine);
  const confirmed = amountOf("RECEIVED");
  const waiting = amountOf("PAYMENT_SUBMITTED");
  const toPay = amountOf("AWAITING_PAYMENT");
  const students = funded.reduce((sum, n) => sum + n.studentsBenefited, 0);
  const loading = needsLoading || fundedLoading;
  const ready = !loading && !loadError;
  const shown = (value) => (loadError ? "—" : value);

  let summary = "Find approved needs in government schools, fund part or all of one, and pay online or directly to the school.";
  if (ready && toPay > 0) summary = `You have ${formatINR(toPay)} still to pay for the parts you've committed to.`;
  else if (ready && openNeeds.length) {
    summary = `${openNeeds.length} school ${openNeeds.length === 1 ? "need is" : "needs are"} open to funding in ${openSchools.size} ${openSchools.size === 1 ? "school" : "schools"}.`;
  }

  const quickActions = [
    { icon: LuClipboardList, label: "Browse school needs", desc: "Approved needs you can fund", to: "#needs" },
    { icon: LuWallet, label: "Make a payment", desc: "Pay for the parts you committed to", to: "#funding" },
    { icon: LuFolderKanban, label: "Your projects", desc: "The needs you fund and how they're going", to: "#projects" },
    { icon: LuUsers, label: "Volunteers", desc: "Your team and the need each works on", to: "#volunteers" },
    { icon: LuCalendarDays, label: "School events", desc: "Offer help for upcoming events", to: "#events" },
    { icon: LuFileChartColumn, label: "Reports", desc: "Download your report card", to: "#reports" },
  ];

  return (
    <>
      <PortalHero
        userName={userName}
        title={ngoName}
        fallbackTitle="Your NGO"
        loading={profileLoading}
        summary={summary}
        tile={<HeroIconTile><LuHeartHandshake className="h-7 w-7" aria-hidden="true" /></HeroIconTile>}
        facts={
          <>
            {/* Only accounts the admin has approved can sign in, so this is always true here. */}
            <HeroFact icon={LuCircleCheck}>Verified NGO</HeroFact>
            {profile?.type && <HeroFact>{profile.type}</HeroFact>}
            {place && <HeroFact icon={LuMapPin}>{place}</HeroFact>}
            {focus.length > 0 && <HeroFact>Focus: {focus.join(", ")}</HeroFact>}
          </>
        }
        actions={
          <>
            <Link to="#funding" className={buttonClasses({ variant: "secondary" })}>
              <LuWallet className="h-4 w-4" aria-hidden="true" /> Funding
            </Link>
            <Link to="#needs" className={buttonClasses()}>
              <LuClipboardList className="h-4 w-4" aria-hidden="true" /> School needs
            </Link>
          </>
        }
      />
      {notice}

      {loadError && (
        <Alert tone="danger">
          {loadError} <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}

      {/* The main figure gets the most room; the others sit beside it. */}
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">Overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <RingCard
            id="funding"
            className="col-span-2 lg:row-span-2"
            icon={LuWallet}
            title="Your funding"
            subtitle="Across the needs you've committed to"
            link={{ to: "#funding", label: "Open funding" }}
            loading={loading}
            loadingLabel="Loading your funding…"
            failed={Boolean(loadError)}
            failedText="Your funding can’t be shown right now. Try reloading the page."
            value={confirmed}
            goal={committed}
            centerLabel="confirmed"
            srText={(percent) => `${formatINR(confirmed)} paid and confirmed of ${formatINR(committed)} committed, ${percent}%.`}
            facts={[
              { label: "Committed", value: formatINR(committed) },
              { label: "Paid and confirmed", value: formatINR(confirmed), tone: "text-emerald-700" },
              { label: "Waiting for school", value: formatINR(waiting), tone: waiting ? "text-amber-700" : undefined },
              { label: "Still to pay", value: formatINR(toPay), tone: toPay ? "text-primary-700" : undefined },
            ]}
            empty={{
              title: "No commitments yet",
              text: "Fund part or all of a school need, and you'll follow your payments here until the school confirms them.",
              action: <Link to="#needs" className={buttonClasses({ size: "sm" })}>Browse school needs</Link>,
            }}
            footer={
              toPay > 0 && (
                <WaitingLink to="#funding">
                  <span className="font-semibold">{formatINR(toPay)}</span> still to pay for your parts
                </WaitingLink>
              )
            }
          />
          <MetricCard label="Open school needs" value={shown(openNeeds.length)} icon={LuClipboardList} tone="blue" loading={loading} hint={ready && openNeeds.length ? `In ${openSchools.size} ${openSchools.size === 1 ? "school" : "schools"}` : "Approved by the VIDYADAAN team"} to="#needs" />
          <MetricCard label="Still needed" value={shown(formatINR(stillNeeded))} icon={LuIndianRupee} tone="amber" loading={loading} hint="Across the parts still free" />
          <MetricCard label="Students you support" value={shown(students.toLocaleString("en-IN"))} icon={LuGraduationCap} tone="green" loading={loading} hint={ready && funded.length ? `Across ${funded.length} ${funded.length === 1 ? "project" : "projects"}` : "Across your projects"} to={funded.length ? "#projects" : undefined} />
          <MetricCard label="Upcoming school events" value={upcomingEvents} icon={LuCalendarDays} tone="blue" loading={eventsLoading} hint="Offer help for one" to="#events" />
        </div>
      </section>

      <QuickActions actions={quickActions} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="overflow-hidden xl:col-span-3">
          <CardHeader
            title="Newest school needs"
            description={ready && openNeeds.length ? `${openNeeds.length} open to funding` : undefined}
            actions={openNeeds.length > 0 && <ViewAll to="#needs" />}
          />
          {needsLoading && <RowSkeletons label="Loading school needs…" />}
          {!needsLoading && !loadError && openNeeds.length === 0 && (
            <EmptyState
              icon={LuClipboardList}
              title="No open school needs right now"
              description="When the VIDYADAAN team approves a school's request, it will appear here."
              className="py-8"
            />
          )}
          {openNeeds.length > 0 && (
            <ul className="divide-y divide-surface-divider">
              {openNeeds.slice(0, PREVIEW_ROWS).map((n) => {
                const free = freeParts(n);
                const where = schoolPlace(n.school);
                return (
                  <li key={n.id}>
                    <button type="button" onClick={() => onViewNeed(n)} className={`${ROW} w-full items-center text-left`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-primary-700">{n.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{n.school.name}{where && ` · ${where}`}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-semibold tabular-nums text-slate-900">{formatINR(sumAmounts(free))}</span>
                        <span className="block text-xs text-slate-500">{free.length} of {n.parts.length} parts free</span>
                      </span>
                      <RowArrow />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader title="Your projects" actions={funded.length > 0 && <ViewAll to="#projects" />} />
          {fundedLoading && <RowSkeletons rows={2} label="Loading your projects…" />}
          {!fundedLoading && !loadError && funded.length === 0 && (
            <EmptyState
              icon={LuFolderKanban}
              title="No projects yet"
              description="Fund part or all of a school need and it becomes one of your projects."
              className="py-8"
            />
          )}
          {funded.length > 0 && (
            <ul className="divide-y divide-surface-divider">
              {funded.slice(0, PREVIEW_ROWS).map((p) => {
                const parts = myParts(p);
                const money = fundingStatus(parts);
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => onViewNeed(p)} className={`${ROW} w-full items-center gap-3 text-left`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-primary-700">{p.title}</span>
                        <span className="mt-0.5 block text-xs tabular-nums text-slate-500">{formatINR(sumAmounts(parts))} committed</span>
                      </span>
                      <Badge tone={money.tone}>{money.label}</Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
};

export default OverviewView;
