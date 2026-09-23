import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuCalendarPlus, LuChartBar, LuCircleCheck, LuFileText, LuFolderKanban, LuHandHeart, LuHeartHandshake, LuImagePlus,
  LuPencil, LuPlus, LuSchool, LuTrendingUp, LuTriangleAlert, LuUsers, LuWallet,
} from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import CreateNeedModal from "../../../components/dashboard/school/CreateNeedModal";
import CreateEventModal from "../../../components/events/CreateEventModal";
import Badge, { StatusBadge } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card, { CardHeader } from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
import ProgressBar from "../../../components/ui/ProgressBar";
import ProtectedImage from "../../../components/ui/ProtectedImage";
import StatCard from "../../../components/ui/StatCard";
import { buttonClasses } from "../../../components/ui/classes";
import { useAuth } from "../../../context/AuthContext";
import useMyProfile, { toSchoolDisplayProfile } from "../../../hooks/useMyProfile";

import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_SUMMARY_CARDS,
  NOTIFICATIONS_LIST,
  RECENT_DONATIONS,
  NGO_ACTIVITY,
} from "../../../data/schoolDataStore";
import { SCHOOL_PROJECTS_LIST } from "../../../data/projects";
import { SCHOOL_EVENTS_LIST } from "../../../data/events";
import { getFundingPercentage } from "../../../utils/funding";

const SUMMARY_ICONS = {
  total: LuFolderKanban,
  critical: LuTriangleAlert,
  progress: LuTrendingUp,
  completed: LuCircleCheck,
  students: LuUsers,
  donations: LuWallet,
  ngos: LuHeartHandshake,
  donors: LuHandHeart,
};

const ViewAll = ({ to, children = "View all" }) => (
  <Link to={to} className="text-sm font-medium text-blue-700 hover:underline">{children}</Link>
);

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Dashboard = () => {
  const { user } = useAuth();
  // Registered school details + photo from the API; mock values fill fields registration doesn't collect.
  const { profile: myProfile } = useMyProfile();
  const profile = toSchoolDisplayProfile(myProfile, INITIAL_SCHOOL_PROFILE);
  const recentProjects = SCHOOL_PROJECTS_LIST.slice(0, 3);
  const recentEvents = SCHOOL_EVENTS_LIST.slice(0, 2);
  const unread = NOTIFICATIONS_LIST.filter((n) => !n.read);

  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const quickActions = [
    { icon: LuPlus, label: "New infrastructure project", desc: "Create a need request", onClick: () => setIsNeedModalOpen(true) },
    { icon: LuCalendarPlus, label: "New school event", desc: "Plan an event and request support", onClick: () => setIsEventModalOpen(true) },
    { icon: LuImagePlus, label: "Upload progress photos", desc: "Before, working and completion", to: "/dashboard/school/progress" },
    { icon: LuSchool, label: "School profile", desc: "Update school details", to: "/dashboard/school/profile" },
    { icon: LuFileText, label: "Reports", desc: "Donation and impact reports", to: "/dashboard/school/reports" },
    { icon: LuChartBar, label: "All projects", desc: "Complete project list", to: "/dashboard/school/projects" },
  ];

  return (
    <DashboardLayout
      role="school"
      userName={user?.name || profile.principalName}
      userSub={user?.email || profile.district}
      title="Dashboard"
      subtitle={`${profile.name} · ${profile.district}`}
      notifications={unread}
    >
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            leading={
              <span className="w-14 h-14 rounded-control border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                <ProtectedImage
                  fileId={profile.photo?.id}
                  alt={`${profile.name} photograph`}
                  className="w-full h-full object-cover"
                  fallback={<LuSchool className="w-6 h-6 text-slate-400" aria-hidden="true" />}
                />
              </span>
            }
            title={profile.name}
            meta={
              <>
                <Badge tone="success" icon={LuCircleCheck}>Verified school</Badge>
                <span>UDISE {profile.udise}</span>
                <span>{profile.district}</span>
                <span>{profile.studentsCount} students · {profile.teachersCount} teachers</span>
              </>
            }
            actions={
              <>
                <Link to="/dashboard/school/profile" className={buttonClasses({ variant: "secondary" })}>
                  <LuPencil className="w-4 h-4" aria-hidden="true" /> Edit profile
                </Link>
                <Button icon={LuPlus} onClick={() => setIsNeedModalOpen(true)}>New project</Button>
              </>
            }
          />

          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="sr-only">Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {INITIAL_SUMMARY_CARDS.map((card) => (
                <StatCard
                  key={card.id}
                  label={card.label}
                  value={card.value}
                  icon={SUMMARY_ICONS[card.id]}
                  hint={card.change > 0 ? `+${card.change} this month` : undefined}
                />
              ))}
            </div>
          </section>

          <Card>
            <CardHeader title="Quick actions" />
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-200 rounded-b-2xl overflow-hidden">
              {quickActions.map(({ icon: Icon, label, desc, onClick, to }) => {
                const content = (
                  <>
                    <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900">{label}</span>
                      <span className="block text-xs text-slate-500">{desc}</span>
                    </span>
                  </>
                );
                const cls = "flex items-center gap-3 w-full h-full px-5 py-4 bg-white text-left hover:bg-slate-50 transition-colors";
                return (
                  <li key={label}>
                    {to ? <Link to={to} className={cls}>{content}</Link> : <button type="button" onClick={onClick} className={cls}>{content}</button>}
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader
                title="Recent infrastructure projects"
                description={`${SCHOOL_PROJECTS_LIST.length} projects in total`}
                actions={<ViewAll to="/dashboard/school/projects" />}
              />
              <ul className="divide-y divide-slate-200">
                {recentProjects.map((proj) => (
                  <li key={proj.id}>
                    <Link to={`/project/${proj.id}?role=school`} className="flex gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <img src={proj.heroImage} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">{proj.title}</p>
                          <div className="flex gap-1.5">
                            <StatusBadge status={proj.status} />
                            <StatusBadge status={proj.priority} />
                          </div>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {proj.category} · {proj.studentsBenefited} students · {proj.ngoPartner}
                        </p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <ProgressBar value={proj.progress} label={`${proj.title} progress`} />
                          <span className="text-xs font-medium text-slate-700 tabular-nums shrink-0">{proj.progress}%</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{formatINR(proj.raised)} raised · Updated {proj.lastUpdated}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Notifications" description={`${unread.length} unread`} actions={<ViewAll to="/dashboard/school/notifications" />} />
              <ul className="divide-y divide-slate-200">
                {NOTIFICATIONS_LIST.map((notif) => (
                  <li key={notif.id} className="flex gap-3 px-5 py-3.5">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? "bg-slate-300" : "bg-blue-600"}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.read ? "text-slate-600" : "font-medium text-slate-900"}`}>
                        {notif.title}
                        {!notif.read && <span className="sr-only"> (unread)</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{notif.desc}</p>
                      <p className="mt-1 text-xs text-slate-500">{notif.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <CardHeader title="School events" description={`${SCHOOL_EVENTS_LIST.length} events`} actions={<ViewAll to="/dashboard/school/events" />} />
            <ul className="divide-y divide-slate-200">
              {recentEvents.map((evt) => {
                const pct = getFundingPercentage(evt.requiredBudget, evt.raisedAmount);
                return (
                  <li key={evt.id}>
                    <Link to="/dashboard/school/events" className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <img src={evt.banner} alt="" className="w-full sm:w-24 h-24 sm:h-16 rounded-lg object-cover bg-slate-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">{evt.title}</p>
                          <StatusBadge status={evt.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{evt.category} · {evt.date} · {evt.requiredItems?.length} items needed</p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <ProgressBar value={pct} label={`${evt.title} funding`} />
                          <span className="text-xs text-slate-600 tabular-nums shrink-0">{formatINR(evt.raisedAmount)} of {formatINR(evt.requiredBudget)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Latest donations" actions={<ViewAll to="/dashboard/school/donations" />} />
              <ul className="divide-y divide-slate-200">
                {RECENT_DONATIONS.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-center shrink-0" aria-hidden="true">
                      {d.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{d.donor}</p>
                      <p className="text-xs text-slate-500 truncate">{d.purpose}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-slate-900 tabular-nums">{formatINR(d.amount)}</p>
                      <p className="text-xs text-slate-500">{d.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="px-5 py-3 border-t border-slate-200 text-sm text-slate-600">
                Total this month: <span className="font-medium text-slate-900">₹67,500</span>
              </p>
            </Card>

            <Card>
              <CardHeader title="NGO activity" description="3 NGO partners are supporting your school" />
              <ul className="divide-y divide-slate-200">
                {NGO_ACTIVITY.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0" aria-hidden="true">
                      <LuHeartHandshake className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900"><span className="font-medium">{a.ngo}</span> {a.action.charAt(0).toLowerCase() + a.action.slice(1)}</p>
                      <p className="mt-0.5 text-xs text-slate-500 truncate">{a.project}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{a.time}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </main>

      <CreateNeedModal isOpen={isNeedModalOpen} onClose={() => setIsNeedModalOpen(false)} onCreateNeed={() => {}} />
      <CreateEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onCreateEvent={() => {}} />
    </DashboardLayout>
  );
};

export default Dashboard;
