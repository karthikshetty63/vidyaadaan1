import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuBadgeCheck, LuCalendarPlus, LuCircleCheck, LuClock, LuFileChartColumn, LuFilePen, LuFolderKanban,
  LuGraduationCap, LuHandCoins, LuHeartHandshake, LuMapPin, LuPencil, LuPlus, LuSchool, LuTrendingUp, LuUsers,
} from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ProjectStatusBadge from "../../../components/dashboard/ProjectStatusBadge";
import { HeroFact, HeroIconTile, MetricCard, PortalHero, QuickActions, ROW, RowArrow, RowSkeletons, Skeleton } from "../../../components/dashboard/PortalWidgets";
import { FundingCard, PipelineBar } from "../../../components/dashboard/school/HomeWidgets";
import PaymentQrCard from "../../../components/dashboard/school/PaymentQrCard";
import ProjectFormModal from "../../../components/dashboard/school/ProjectFormModal";
import { groupCommitments, groupStatus } from "../../../components/dashboard/school/commitments";
import Alert from "../../../components/ui/Alert";
import { StatusBadge } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card, { CardHeader } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import ProgressBar from "../../../components/ui/ProgressBar";
import ProtectedImage from "../../../components/ui/ProtectedImage";
import { buttonClasses } from "../../../components/ui/classes";
import CategoryIcon from "../../../components/ui/CategoryIcon";
import { useAuth } from "../../../context/AuthContext";
import useMyProfile, { toSchoolDisplayProfile } from "../../../hooks/useMyProfile";
import useMyProjects from "../../../hooks/useMyProjects";
import { useAlumniSummary } from "../../../hooks/useSchoolAlumni";
import useSchoolCommitments from "../../../hooks/useSchoolCommitments";
import useSchoolDonations from "../../../hooks/useSchoolDonations";
import useSchoolEvents from "../../../hooks/useSchoolEvents";
import useSchoolPayments from "../../../hooks/useSchoolPayments";
import { FUNDING_PARTS } from "../../../api/projects";
import { getFundingPercentage } from "../../../utils/funding";
import { formatINR, partsOf } from "../../../utils/format";

// Shown until the school's profile has loaded, so no sample school ever appears.
const NO_PROFILE = { name: "", udise: "", district: "", studentsCount: "—", teachersCount: "—", principalName: "", photo: null };

// What the review team last did with each project, newest first, in "Review updates".
const REVIEW_UPDATES = {
  PENDING_REVIEW: { label: "Sent for review", dot: "bg-amber-500" },
  OPEN: { label: "Approved", dot: "bg-emerald-500" },
  REJECTED: { label: "Changes requested", dot: "bg-red-500" },
};

const ViewAll = ({ to, children = "View all" }) => (
  <Link to={to} className="rounded-md text-sm font-medium text-primary-700 hover:underline">{children}</Link>
);

const formatDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const formatWhen = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const Dashboard = () => {
  const { user } = useAuth();
  const { profile: myProfile, loading: profileLoading, setProfile } = useMyProfile();
  const profile = toSchoolDisplayProfile(myProfile, NO_PROFILE);
  const { projects, loading, error, reload, upsert } = useMyProjects();
  const { commitments, loading: commitmentsLoading, error: commitmentsError } = useSchoolCommitments();
  const ngoActivity = groupCommitments(commitments);
  const { payments } = useSchoolPayments();
  const paymentsToCheck = payments.filter((p) => p.status === "SUBMITTED");
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const alumniSummary = useAlumniSummary();
  const donationList = useSchoolDonations();
  const donations = donationList.donations;
  // Offers of help on the school's events that it hasn't answered yet.
  const { events } = useSchoolEvents();
  const offersWaiting = events.reduce((count, e) => count + e.offers.filter((o) => o.status === "OFFERED").length, 0);

  // Every figure below is counted from the school's own records. Only approved projects count
  // towards students and funding.
  const approved = projects.filter((p) => p.reviewStatus === "OPEN");
  const rejected = projects.filter((p) => p.reviewStatus === "REJECTED");
  const stats = {
    total: projects.length,
    pending: projects.filter((p) => p.reviewStatus === "PENDING_REVIEW").length,
    approved: approved.length,
    rejected: rejected.length,
    students: approved.reduce((sum, p) => sum + p.studentsBenefited, 0),
    raised: approved.reduce((sum, p) => sum + p.raised, 0),
    needed: approved.reduce((sum, p) => sum + p.budget, 0),
  };
  const committed = commitments.reduce((sum, c) => sum + c.amount, 0);
  const ready = !loading && !error;
  const shown = (value) => (error ? "—" : value);

  // From submission to completion. Approved projects are split by the work status the school sets.
  const stages = [
    { key: "pending", label: "Waiting for review", count: stats.pending, color: "bg-amber-400" },
    { key: "rejected", label: "Changes requested", count: stats.rejected, color: "bg-red-400" },
    { key: "open", label: "Open for support", count: approved.filter((p) => p.status === "Open").length, color: "bg-primary-300" },
    { key: "progress", label: "In progress", count: approved.filter((p) => p.status === "In Progress").length, color: "bg-primary-600" },
    { key: "hold", label: "On hold", count: approved.filter((p) => p.status === "On Hold").length, color: "bg-slate-300" },
    { key: "done", label: "Completed", count: approved.filter((p) => p.status === "Completed").length, color: "bg-emerald-500" },
  ];

  const recentProjects = projects.slice(0, 3);
  const reviewUpdates = projects
    .map((p) => ({ project: p, at: (p.reviewStatus === "PENDING_REVIEW" ? p.submittedAt : p.reviewedAt) || p.submittedAt }))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 4);

  const quickActions = [
    { icon: LuPlus, label: "New infrastructure project", desc: "Create a need request", onClick: () => setIsNeedModalOpen(true) },
    { icon: LuCalendarPlus, label: "School events", desc: "Post an event and answer offers of help", to: "/dashboard/school/events" },
    { icon: LuTrendingUp, label: "Project progress", desc: "Details and updates for each project", to: "/dashboard/school/progress" },
    { icon: LuSchool, label: "School profile", desc: "Update school details", to: "/dashboard/school/profile" },
    { icon: LuFileChartColumn, label: "Reports", desc: "Donation and impact reports", to: "/dashboard/school/reports" },
    { icon: LuFolderKanban, label: "All projects", desc: "Complete project list", to: "/dashboard/school/projects" },
  ];

  const newProjectButton = <Button icon={LuPlus} onClick={() => setIsNeedModalOpen(true)}>New project</Button>;

  let summary = "Create infrastructure projects, follow their review and funding, and check payments from NGOs.";
  if (ready && stats.pending) {
    summary = `${stats.pending} ${stats.pending === 1 ? "project is" : "projects are"} waiting for review by the VIDYADAAN team.`;
  } else if (ready && stats.approved) {
    summary = `${stats.approved} approved ${stats.approved === 1 ? "project has" : "projects have"} raised ${formatINR(stats.raised)} of ${formatINR(stats.needed)} so far.`;
  }

  return (
    <DashboardLayout
      role="school"
      userName={user?.name}
      userSub={user?.email}
      title="Dashboard"
      subtitle={[profile.name, profile.district].filter(Boolean).join(" · ")}
    >
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <PortalHero
            userName={user?.name}
            title={profile.name}
            fallbackTitle="Your school"
            loading={profileLoading}
            summary={summary}
            tile={
              <HeroIconTile>
                <ProtectedImage
                  fileId={profile.photo?.id}
                  alt={`${profile.name} photograph`}
                  className="h-full w-full object-cover"
                  fallback={<LuSchool className="h-7 w-7 text-primary-600" aria-hidden="true" />}
                />
              </HeroIconTile>
            }
            facts={
              <>
                {/* Only accounts the admin has approved can sign in, so this is always true here. */}
                <HeroFact icon={LuCircleCheck}>Verified school</HeroFact>
                {profile.udise && <HeroFact>UDISE {profile.udise}</HeroFact>}
                {profile.district && <HeroFact icon={LuMapPin}>{profile.district}</HeroFact>}
                {(myProfile?.students != null || myProfile?.teachers != null) && (
                  <HeroFact icon={LuUsers}>{profile.studentsCount} students · {profile.teachersCount} teachers</HeroFact>
                )}
                {alumniSummary && (
                  <HeroFact icon={LuGraduationCap} to="/dashboard/school/alumni">
                    {alumniSummary.active === 1 ? "1 active alum" : `${alumniSummary.active.toLocaleString("en-IN")} active alumni`}
                  </HeroFact>
                )}
              </>
            }
            actions={
              <>
                <Link to="/dashboard/school/profile" className={buttonClasses({ variant: "secondary" })}>
                  <LuPencil className="h-4 w-4" aria-hidden="true" /> Edit profile
                </Link>
                {newProjectButton}
              </>
            }
          />

          {error && (
            <Alert tone="danger">
              {error}{" "}
              <button type="button" onClick={reload} className="font-medium underline underline-offset-2">Try again</button>
            </Alert>
          )}

          {offersWaiting > 0 && (
            <Alert tone="info" title={`${offersWaiting} ${offersWaiting === 1 ? "offer of help is" : "offers of help are"} waiting for your answer`}>
              NGOs or donors have offered to help with your school events.{" "}
              <Link to="/dashboard/school/events" className="font-medium underline underline-offset-2">Open school events</Link>
            </Alert>
          )}

          {/* The main figure gets the most room; the others sit beside it. */}
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="sr-only">Overview</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <FundingCard
                className="col-span-2 lg:row-span-2"
                loading={loading}
                failed={Boolean(error)}
                raised={stats.raised}
                goal={stats.needed}
                committed={commitmentsError ? null : committed}
                committedLoading={commitmentsLoading}
                paymentsToCheck={paymentsToCheck.length}
              />
              <MetricCard label="Waiting for review" value={shown(stats.pending)} icon={LuClock} tone="amber" loading={loading} hint="With the VIDYADAAN team" />
              <MetricCard label="Approved" value={shown(stats.approved)} icon={LuBadgeCheck} tone="green" loading={loading} hint="Open to NGOs and donors" />
              <MetricCard
                label="Changes requested"
                value={shown(stats.rejected)}
                icon={LuFilePen}
                tone="red"
                loading={loading}
                hint={ready ? (stats.rejected ? "Edit and resubmit" : "Nothing to fix") : undefined}
                // With a project to fix, the box opens it.
                to={ready && rejected.length ? `/dashboard/school/progress?project=${rejected[0].id}` : undefined}
              />
              <MetricCard label="Students benefiting" value={shown(stats.students.toLocaleString("en-IN"))} icon={LuGraduationCap} tone="blue" loading={loading} hint="Across approved projects" />
            </div>
          </section>

          <Card>
            <CardHeader
              title="Project pipeline"
              description={ready ? `${stats.total} ${stats.total === 1 ? "project" : "projects"}, from review to completion` : undefined}
              actions={ready && stats.total > 0 && <ViewAll to="/dashboard/school/projects">Manage projects</ViewAll>}
            />
            <div className="px-5 py-5">
              {!ready && !error && (
                <div role="status">
                  <span className="sr-only">Loading your projects…</span>
                  <Skeleton className="h-3 w-full rounded-full" />
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    {stages.map((s) => <Skeleton key={s.key} className="h-4" />)}
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-slate-500">Your projects couldn&rsquo;t be loaded.</p>}
              {ready && stats.total > 0 && <PipelineBar stages={stages} total={stats.total} />}
              {ready && stats.total === 0 && (
                <p className="text-sm text-slate-500">No projects yet. Create your school&rsquo;s first project to start.</p>
              )}
            </div>
          </Card>

          <QuickActions actions={quickActions} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden xl:col-span-2">
              <CardHeader
                title="Recent infrastructure projects"
                description={ready ? `${stats.total} ${stats.total === 1 ? "project" : "projects"} in total` : undefined}
                actions={ready && stats.total > 0 && <ViewAll to="/dashboard/school/projects" />}
              />
              {loading && <RowSkeletons label="Loading your projects…" />}
              {!loading && error && projects.length === 0 && (
                <p className="px-5 py-4 text-sm text-slate-500">Your projects couldn&rsquo;t be loaded.</p>
              )}
              {ready && recentProjects.length === 0 && (
                <EmptyState
                  icon={LuFolderKanban}
                  title="No projects yet"
                  description="Create your school's first project. The VIDYADAAN team reviews it before NGOs and donors can see it."
                  action={newProjectButton}
                />
              )}
              {recentProjects.length > 0 && (
                <ul className="divide-y divide-surface-divider">
                  {recentProjects.map((proj) => {
                    const funded = getFundingPercentage(proj.budget, proj.raised);
                    return (
                      <li key={proj.id}>
                        <Link to={`/dashboard/school/progress?project=${proj.id}`} className={ROW}>
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
                            <CategoryIcon category={proj.category} className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700">{proj.title}</p>
                              <div className="flex gap-1.5">
                                <ProjectStatusBadge project={proj} />
                                <StatusBadge status={proj.priority} />
                              </div>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {proj.category} · {proj.studentsBenefited.toLocaleString("en-IN")} students · Due {formatDate(proj.expectedCompletion)}
                            </p>
                            {proj.reviewStatus === "REJECTED" && proj.rejectionReason && (
                              <p className="mt-1 line-clamp-1 text-xs font-medium text-red-700">Changes requested: {proj.rejectionReason}</p>
                            )}
                            <div className="mt-2.5 flex items-center gap-3">
                              <ProgressBar value={funded} label={`${proj.title} funding`} />
                              <span className="shrink-0 text-xs tabular-nums text-slate-600">{formatINR(proj.raised)} of {formatINR(proj.budget)}</span>
                            </div>
                          </div>
                          <RowArrow />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="overflow-hidden">
              <CardHeader
                title="Review updates"
                description={ready ? (stats.pending ? `${stats.pending} waiting for review` : "From the VIDYADAAN team") : undefined}
                actions={<ViewAll to="/dashboard/school/notifications" />}
              />
              {loading && <RowSkeletons rows={2} label="Loading review updates…" />}
              {ready && reviewUpdates.length === 0 && (
                <EmptyState
                  icon={LuClock}
                  title="No review updates yet"
                  description="When you submit a project, you'll see here when it's approved or needs changes."
                  className="py-8"
                />
              )}
              {reviewUpdates.length > 0 && (
                <ul className="divide-y divide-surface-divider">
                  {reviewUpdates.map(({ project, at }) => {
                    const update = REVIEW_UPDATES[project.reviewStatus];
                    return (
                      <li key={project.id}>
                        <Link to={`/dashboard/school/progress?project=${project.id}`} className={`${ROW} gap-3 py-3.5`}>
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${update.dot}`} aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{update.label}</p>
                            <p className="mt-0.5 truncate text-xs text-slate-600">{project.title}</p>
                            {project.reviewStatus === "REJECTED" && project.rejectionReason && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-red-700">{project.rejectionReason}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-500">{formatWhen(at)}</p>
                          </div>
                          <RowArrow />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <PaymentQrCard
            paymentQr={myProfile?.paymentQr || null}
            verifiedUpiId={myProfile?.upi || ""}
            loading={profileLoading}
            onChange={(paymentQr) => setProfile((p) => (p ? { ...p, paymentQr } : p))}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden xl:col-span-2">
              <CardHeader
                title="NGO activity"
                description={ngoActivity.length ? `${formatINR(committed)} promised by NGOs` : undefined}
              />
              {commitmentsLoading && <RowSkeletons rows={2} label="Loading NGO activity…" />}
              {!commitmentsLoading && commitmentsError && <p className="px-5 py-4 text-sm text-slate-500">{commitmentsError}</p>}
              {!commitmentsLoading && !commitmentsError && ngoActivity.length === 0 && (
                <EmptyState
                  icon={LuHeartHandshake}
                  title="No NGO activity yet"
                  description="When an NGO commits to fund one of your approved projects, it will appear here."
                  className="py-8"
                />
              )}
              {ngoActivity.length > 0 && (
                <ul className="divide-y divide-surface-divider">
                  {ngoActivity.slice(0, 4).map((a) => (
                    <li key={a.key}>
                      <Link to={`/dashboard/school/progress?project=${a.projectId}`} className={`${ROW} gap-3 py-3.5`}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.received === a.parts.length ? "bg-emerald-500" : a.toCheck ? "bg-amber-500" : "bg-primary-500"}`} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{a.ngo.name} committed {formatINR(a.amount)}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-600">
                            {a.projectTitle} · {partsOf(a.parts, FUNDING_PARTS).toLowerCase()}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatWhen(a.committedAt)} · {groupStatus(a)}
                          </p>
                        </div>
                        <RowArrow />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Confirmed donor donations: amounts and dates only (a school never sees who its donors are). */}
            <Card className="overflow-hidden">
              <CardHeader
                title="Latest donations"
                description={donations.length ? `${formatINR(donations.reduce((sum, d) => sum + d.amount, 0))} from ${donations.length} ${donations.length === 1 ? "donation" : "donations"}` : "From donors, confirmed by Razorpay"}
                actions={donations.length > 0 && <ViewAll to="/dashboard/school/donations" />}
              />
              {donationList.loading && <RowSkeletons rows={2} label="Loading donations…" />}
              {!donationList.loading && donationList.error && <p className="px-5 py-4 text-sm text-slate-500">{donationList.error}</p>}
              {!donationList.loading && !donationList.error && donations.length === 0 && (
                <EmptyState
                  icon={LuHandCoins}
                  title="No donations yet"
                  description="When a donor gives to one of your approved projects, it appears here once Razorpay confirms it."
                  className="py-8"
                />
              )}
              {donations.length > 0 && (
                <ul className="divide-y divide-surface-divider">
                  {donations.slice(0, 4).map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{d.project.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatWhen(d.verifiedAt)}
                          {d.mode === "test" ? " · test mode" : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-700">{formatINR(d.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>

      {isNeedModalOpen && <ProjectFormModal open onClose={() => setIsNeedModalOpen(false)} onSaved={upsert} />}
    </DashboardLayout>
  );
};

export default Dashboard;
