import { LuFolderKanban } from "react-icons/lu";
import { Link } from "react-router-dom";
import StackedBar from "../../../components/charts/StackedBar";
import { SERIES_COLORS } from "../../../components/charts/palette";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ProjectStatusBadge from "../../../components/dashboard/ProjectStatusBadge";
import ReportDownloads from "../../../components/dashboard/ReportDownloads";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Card, { CardHeader } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import ProgressBar from "../../../components/ui/ProgressBar";
import StatCard from "../../../components/ui/StatCard";
import { buttonClasses } from "../../../components/ui/classes";
import { projectStatusLabel } from "../../../api/projects";
import { useAuth } from "../../../context/AuthContext";
import useMyProfile from "../../../hooks/useMyProfile";
import useMyProjects from "../../../hooks/useMyProjects";
import useSchoolPayments from "../../../hooks/useSchoolPayments";
import { buildSchoolReport } from "../../../utils/reportCards";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const formatDate = (iso) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const percentOf = (part, whole) => (whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0);

const COLUMNS = ["Project", "Category", "Priority", "Status", "Budget", "Raised", "Students", "Due", "Submitted"];
// Where a project stands, in order; each stage always keeps the same colour.
const STAGES = ["Pending review", "Rejected", "Open", "In Progress", "On Hold", "Completed"];
const projectCount = (n) => `${n} ${n === 1 ? "project" : "projects"}`;

/** One plain total with a bar under it: "₹5,000 of ₹25,000" and a sentence saying what it means. */
const Total = ({ value, of, percent, label, children }) => (
  <div className="px-5 py-5">
    <p className="text-2xl font-extrabold tabular-nums tracking-tight text-brand-navy">
      {value} <span className="text-base font-medium text-slate-500">of {of}</span>
    </p>
    <ProgressBar value={percent} size="md" label={label} className="mt-3" />
    <p className="mt-2 text-sm text-slate-600">{children}</p>
  </div>
);

const Reports = () => {
  const { user } = useAuth();
  const { projects, loading, error, reload } = useMyProjects();
  const { profile } = useMyProfile();
  const { payments, loading: paymentsLoading } = useSchoolPayments();

  // Every figure is counted from the school's own projects.
  const approved = projects.filter((p) => p.reviewStatus === "OPEN");
  const ready = !loading && !error;
  const summary = [
    { label: "Projects", value: projects.length, hint: `${approved.length} approved` },
    { label: "Budget requested", value: formatINR(projects.reduce((sum, p) => sum + p.budget, 0)), hint: "All projects" },
    { label: "Funds raised", value: formatINR(approved.reduce((sum, p) => sum + p.raised, 0)), hint: "Approved projects" },
    { label: "Students benefited", value: approved.reduce((sum, p) => sum + p.studentsBenefited, 0).toLocaleString("en-IN"), hint: "Approved projects" },
  ];

  // The chart below is drawn from the same records as the table (the table is its text view).
  const stages = STAGES.map((stage, i) => ({
    key: stage,
    label: stage,
    value: projects.filter((p) => projectStatusLabel(p) === stage).length,
    color: SERIES_COLORS[i],
  }));

  // Money and students, for approved projects only (the only ones that can be funded).
  const needed = approved.reduce((sum, p) => sum + p.budget, 0);
  const raised = approved.reduce((sum, p) => sum + Math.min(p.raised, p.budget), 0);
  const students = approved.reduce((sum, p) => sum + p.studentsBenefited, 0);
  // Students count as helped once the school marks their project as completed.
  const helped = approved.filter((p) => p.status === "Completed").reduce((sum, p) => sum + p.studentsBenefited, 0);
  const moneyPercent = percentOf(raised, needed);

  // The report card (CSV or Word): the same projects as below, plus the NGO payments for them.
  const buildReport = () => buildSchoolReport({ profile, user, projects, payments });

  return (
    <DashboardLayout role="school" userName={user?.name} userSub={user?.email} title="Reports" subtitle="Your projects in numbers">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            title="Reports"
            description="Your school's report card: projects, funding and NGO payments, from your own records. Download it as a spreadsheet (CSV) or a Word document."
            actions={<ReportDownloads kind="school" buildReport={buildReport} disabled={!ready || paymentsLoading} />}
          />

          {error && (
            <Alert tone="danger">
              {error}{" "}
              <button type="button" onClick={reload} className="font-medium underline underline-offset-2">Try again</button>
            </Alert>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {summary.map((s) => <StatCard key={s.label} label={s.label} value={ready ? s.value : "–"} hint={ready ? s.hint : undefined} />)}
          </div>

          {ready && projects.length > 0 && (
            <>
              <Card>
                <CardHeader title="Where your projects stand" description="Review status until approved, then the work status" />
                <div className="px-5 py-5">
                  <StackedBar segments={stages} unit={projectCount} label="Projects by stage" />
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader title="Money received" description="For your approved projects, from NGOs and donors" />
                  {approved.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-slate-600">Once the VIDYADAAN team approves a project, the money it receives is shown here.</p>
                  ) : (
                    <>
                      <Total value={formatINR(raised)} of={formatINR(needed)} percent={moneyPercent} label="Money received for all approved projects">
                        {raised >= needed ? "All the money your approved projects need has come in." : `${moneyPercent}% received. ${formatINR(needed - raised)} is still needed.`}
                      </Total>
                      <ul className="divide-y divide-surface-divider border-t border-surface-divider">
                        {approved.map((p) => (
                          <li key={p.id} className="px-5 py-3.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                              <Link to={`/dashboard/school/progress?project=${p.id}`} className="text-sm font-medium text-slate-900 hover:underline">{p.title}</Link>
                              <span className="text-xs tabular-nums text-slate-600">{formatINR(p.raised)} of {formatINR(p.budget)}</span>
                            </div>
                            <ProgressBar value={percentOf(p.raised, p.budget)} label={`Money received for ${p.title}`} className="mt-2" />
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader title="Students helped" description="Counted when you mark a project as Completed" />
                  {approved.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-slate-600">Once the VIDYADAAN team approves a project, the students it will help are shown here.</p>
                  ) : (
                    <>
                      <Total value={helped.toLocaleString("en-IN")} of={`${students.toLocaleString("en-IN")} students`} percent={percentOf(helped, students)} label="Students helped by completed projects">
                        {helped >= students
                          ? "Every approved project is completed."
                          : `${(students - helped).toLocaleString("en-IN")} ${students - helped === 1 ? "student is" : "students are"} waiting for projects that aren't completed yet.`}
                      </Total>
                      <ul className="divide-y divide-surface-divider border-t border-surface-divider">
                        {approved.map((p) => (
                          <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5">
                            <Link to={`/dashboard/school/progress?project=${p.id}`} className="text-sm font-medium text-slate-900 hover:underline">{p.title}</Link>
                            <span className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="tabular-nums">{p.studentsBenefited.toLocaleString("en-IN")} students</span>
                              {p.status === "Completed" ? <Badge tone="success">Completed</Badge> : <Badge>Not completed yet</Badge>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>
              </div>
            </>
          )}

          <Card className="overflow-hidden">
            <CardHeader title="Projects report" description={ready ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}` : undefined} />
            {loading ? (
              <p className="px-5 py-4 text-sm text-slate-500" role="status">Loading your projects…</p>
            ) : projects.length === 0 ? (
              !error && (
                <EmptyState
                  icon={LuFolderKanban}
                  title="Nothing to report yet"
                  description="Reports are built from your projects. Create your first project to see it here."
                  action={<Link to="/dashboard/school/projects" className={buttonClasses()}>Go to projects</Link>}
                />
              )
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-muted border-b border-slate-200 text-left">
                      {COLUMNS.map((h) => (
                        <th key={h} scope="col" className="px-5 py-2.5 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-muted">
                        <td className="px-5 py-3 font-medium text-slate-900 min-w-48">
                          <Link to={`/dashboard/school/progress?project=${p.id}`} className="hover:underline">{p.title}</Link>
                        </td>
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{p.category}</td>
                        <td className="px-5 py-3 text-slate-600">{p.priority}</td>
                        <td className="px-5 py-3"><ProjectStatusBadge project={p} /></td>
                        <td className="px-5 py-3 text-slate-900 tabular-nums whitespace-nowrap">{formatINR(p.budget)}</td>
                        <td className="px-5 py-3 text-slate-900 tabular-nums whitespace-nowrap">{formatINR(p.raised)}</td>
                        <td className="px-5 py-3 text-slate-600 tabular-nums">{p.studentsBenefited.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDate(p.expectedCompletion)}</td>
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDate(p.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Reports;
