import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  LuCalendarDays, LuCircleCheck, LuClipboardList, LuGraduationCap, LuHandCoins, LuHeart, LuIndianRupee, LuLoaderCircle, LuLock,
  LuMapPin, LuPackage, LuSchool, LuSearchX, LuTarget, LuTriangleAlert,
} from "react-icons/lu";
import DashboardHero, { HeroChip, HeroTile } from "../../components/dashboard/DashboardHero";
import PaymentFlowModal from "../../components/payment/PaymentFlowModal";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import CategoryIcon from "../../components/ui/CategoryIcon";
import ProgressBar from "../../components/ui/ProgressBar";
import StatCard from "../../components/ui/StatCard";
import { LogoEmblem } from "../../components/ui/VidyadaanLogo";
import { buttonClasses } from "../../components/ui/classes";
import { getPublicProject } from "../../api/projects";
import { LEGAL_LINKS } from "../../constants/legal";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../../utils/format";
import { getAmountRemaining, getFundingPercentage } from "../../utils/funding";

const SITE = "VIDYADAAN";
const SIGNED_IN_AS = { school: "a school account", ngo: "an NGO account", admin: "an admin account" };
const formatDay = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const placeOf = (school) => [school.district, school.state].filter(Boolean).join(", ");

/**
 * The dashboards' look for a page anyone can open: the indigo theme and sky-blue boxes (index.css),
 * a top bar like the dashboard's (the brand instead of a sidebar), and the policy links at the bottom.
 */
const Shell = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="dashboard-theme dashboard-sky flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 rounded-lg" aria-label={`${SITE} home`}>
            <LogoEmblem className="h-9 w-9 shrink-0" />
            <span className="min-w-0">
              <span className="block text-[15px] font-extrabold leading-tight tracking-wide text-brand-navy">{SITE}</span>
              <span className="block text-xs font-medium leading-tight text-slate-500">School project</span>
            </span>
          </Link>
          {user ? (
            <Link to={`/dashboard/${user.role}`} className={buttonClasses({ variant: "secondary" })}>Go to dashboard</Link>
          ) : (
            <Link to="/login" className={buttonClasses({ variant: "secondary" })}>Sign in</Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {SITE} · Made for government schools in India</p>
          <nav aria-label="Policies">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map(({ label, to }) => (
                <li key={to}><Link to={to} className="transition-colors hover:text-slate-900">{label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
};

/** Loading, not found and error: one message in a box, as the dashboards show them. */
const StateCard = ({ icon: Icon, danger = false, spin = false, title, children }) => (
  <Card className="flex flex-col items-center px-6 py-16 text-center">
    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${danger ? "bg-red-50 text-red-600 ring-red-100" : "bg-surface-muted text-slate-500 ring-surface-line"}`}>
      <Icon className={`h-6 w-6 ${spin ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
    </span>
    <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">{title}</h1>
    {children}
  </Card>
);

/** A real fact about the project, on an indigo icon tile like the dashboards' quick actions. */
const Fact = ({ icon: Icon, label, className = "", children }) => (
  <li className={`flex items-start gap-3 ${className}`}>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </span>
    <span className="min-w-0">
      <span className="block text-xs font-medium text-slate-500">{label}</span>
      <span className="mt-0.5 block text-sm font-semibold text-slate-900">{children}</span>
    </span>
  </li>
);

/**
 * What a visitor can do: donors give through the existing Razorpay donation window; visitors who aren't
 * signed in are offered donor sign-in (they come back here afterwards); other accounts are told why not.
 */
const SupportAction = ({ onSupport }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="h-11" aria-hidden="true" />;
  if (user?.role === "donor") {
    return <Button variant="brand" size="lg" icon={LuHeart} fullWidth onClick={onSupport}>Support this project</Button>;
  }
  if (!user) {
    return (
      <>
        <Link to="/login/donor" state={{ from: location }} className={buttonClasses({ variant: "brand", size: "lg", fullWidth: true })}>
          <LuHeart className="h-4 w-4" aria-hidden="true" /> Sign in to donate
        </Link>
        <p className="mt-3 text-center text-sm text-slate-600">
          New to {SITE}? <Link to="/join/donor" className="font-medium text-primary-700 hover:underline">Create a donor account</Link>
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">Our team checks new accounts before their first sign-in.</p>
      </>
    );
  }
  return (
    <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-slate-700">
      Donations are made from a donor account. You&rsquo;re signed in with {SIGNED_IN_AS[user.role] || "another account"}.
      {user.role === "ngo" && (
        <>
          {" "}
          <Link to="/dashboard/ngo#needs" className="font-medium text-primary-700 underline underline-offset-2">Fund it from the NGO portal</Link>
        </>
      )}
    </p>
  );
};

/** Progress and the call to action. Every amount is the server's. */
const SupportCard = ({ project, onSupport }) => {
  const percent = getFundingPercentage(project.budget, project.raised);
  const fullyFunded = project.raised >= project.budget;
  const completed = project.status === "Completed";
  const done = (text) => (
    <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
      <LuCircleCheck className="h-4 w-4" aria-hidden="true" /> {text}
    </p>
  );

  return (
    <Card as="section" aria-labelledby="support-heading">
      <div className="border-b border-surface-divider px-5 py-4">
        <h2 id="support-heading" className="text-[15px] font-bold tracking-tight text-slate-900">Support this project</h2>
        <p className="mt-0.5 text-xs text-slate-500">Money confirmed so far, from NGOs and donors</p>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className={`text-sm font-semibold tabular-nums ${fullyFunded ? "text-emerald-700" : "text-primary-700"}`}>{percent}% funded</span>
          <span className="text-sm tabular-nums text-slate-600">
            <span className="font-semibold text-slate-900">{formatINR(project.raised)}</span> of {formatINR(project.budget)}
          </span>
        </div>
        <ProgressBar value={percent} size="md" label="Funding progress" className="mt-2.5" />

        <div className="mt-5">
          {completed ? done("This project is complete") : fullyFunded ? done("Fully funded") : <SupportAction onSupport={onSupport} />}
        </div>

        {!completed && !fullyFunded && (
          <p className="mt-5 flex items-start gap-2 border-t border-surface-divider pt-4 text-xs leading-relaxed text-slate-500">
            <LuLock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Donations are paid securely on Razorpay. {SITE} never sees your card, UPI or bank details.{" "}
              <Link to="/refund-policy" className="font-medium text-slate-700 underline underline-offset-2">Refund policy</Link>
            </span>
          </p>
        )}
      </div>
    </Card>
  );
};

/**
 * The public page of one approved project: what an alumni email's "View project" opens. Anyone can view
 * it without signing in; everything on it comes from GET /api/public/projects/:id (approved projects only).
 */
const ProjectDetails = () => {
  const { projectId } = useParams();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, project: null, status: null, error: "" });
  const [donating, setDonating] = useState(false);

  const requestKey = `${projectId}|${reloadCount}`;
  useEffect(() => {
    let cancelled = false;
    getPublicProject(projectId)
      .then((data) => !cancelled && setResult({ key: requestKey, project: data.project, status: 200, error: "" }))
      .catch((err) => !cancelled && setResult({ key: requestKey, project: null, status: err.status || null, error: err.message || "" }));
    return () => {
      cancelled = true;
    };
  }, [projectId, requestKey]);

  // After a donation (or when the server says the need changed): the latest figures, without a loading screen.
  const refresh = () =>
    getPublicProject(projectId).then(
      (data) => setResult((prev) => ({ ...prev, project: data.project, status: 200, error: "" })),
      () => {}
    );

  const loading = result.key !== requestKey;
  const project = loading ? null : result.project;
  const notFound = !loading && result.status === 404;

  // A meaningful tab title (also what a shared link's tab shows), restored when leaving the page.
  useEffect(() => {
    const previous = document.title;
    if (project) document.title = `${project.title} | ${SITE}`;
    else if (notFound) document.title = `Project not found | ${SITE}`;
    return () => {
      document.title = previous;
    };
  }, [project, notFound]);

  // Opened from another page: start at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [projectId]);

  if (loading) {
    return (
      <Shell>
        <div role="status">
          <StateCard icon={LuLoaderCircle} spin title="Loading project…" />
        </div>
      </Shell>
    );
  }
  if (notFound) {
    return (
      <Shell>
        <StateCard icon={LuSearchX} title="Project not found">
          <p className="mt-2 max-w-md text-sm text-slate-600">
            This project may no longer be available, or the link may be incomplete. Check the link in your email, or visit the {SITE} home page.
          </p>
          <Link to="/" className={`${buttonClasses({ variant: "secondary" })} mt-6`}>Go to the home page</Link>
        </StateCard>
      </Shell>
    );
  }
  if (!project) {
    return (
      <Shell>
        <StateCard icon={LuTriangleAlert} danger title="Unable to load this project.">
          {result.error && <p className="mt-2 max-w-md text-sm text-slate-600">{result.error}</p>}
          <Button className="mt-6" onClick={() => setReloadCount((n) => n + 1)}>Try again</Button>
        </StateCard>
      </Shell>
    );
  }

  const place = placeOf(project.school);
  const percent = getFundingPercentage(project.budget, project.raised);
  const remaining = getAmountRemaining(project.budget, project.raised);
  const fullyFunded = project.raised >= project.budget;
  let summary = "Approved by the VIDYADAAN team and open for support.";
  if (project.status === "Completed") summary = "Approved by the VIDYADAAN team. The school has marked this project as completed.";
  else if (fullyFunded) summary = "Approved by the VIDYADAAN team. This project has reached its funding goal.";

  return (
    <Shell>
      <DashboardHero
        leading={
          <HeroTile>
            <CategoryIcon category={project.category} className="h-6 w-6 text-sky-600" />
          </HeroTile>
        }
        eyebrow="School project"
        title={project.title}
        description={summary}
        meta={
          <>
            <HeroChip icon={LuSchool}>{project.school.name}</HeroChip>
            {place && <HeroChip icon={LuMapPin}>{place}</HeroChip>}
            <HeroChip>{project.category}</HeroChip>
            <HeroChip>{project.priority} priority</HeroChip>
            {project.status !== "Open" && <HeroChip icon={LuCircleCheck}>{project.status}</HeroChip>}
          </>
        }
      />

      <section aria-labelledby="funding-overview">
        <h2 id="funding-overview" className="sr-only">Funding</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Raised" value={formatINR(project.raised)} icon={LuHandCoins} tone="emerald" hint={`${percent}% of the goal`} />
          <StatCard label="Goal" value={formatINR(project.budget)} icon={LuTarget} tone="indigo" hint="Budget estimated by the school" />
          <StatCard label="Still needed" value={formatINR(remaining)} icon={LuIndianRupee} tone="amber" hint={fullyFunded ? "Fully funded" : undefined} />
          <StatCard label="Students benefiting" value={project.studentsBenefited.toLocaleString("en-IN")} icon={LuGraduationCap} tone="rose" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* First on phones (right under the figures); the right-hand column on large screens. */}
        <div className="lg:sticky lg:top-24 lg:col-start-3 lg:row-span-3 lg:row-start-1">
          <SupportCard project={project} onSupport={() => setDonating(true)} />
        </div>

        <Card className="lg:col-span-2">
          <CardHeader title="Project need" description="In the school's own words" />
          <p className="whitespace-pre-line px-5 py-4 text-[15px] leading-relaxed text-slate-700">{project.problem}</p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Why this project matters" description="As described by the school and checked by the VIDYADAAN team" />
          <ul className="grid grid-cols-1 gap-5 px-5 py-4 sm:grid-cols-2">
            <Fact icon={LuGraduationCap} label="Students who will benefit">{project.studentsBenefited.toLocaleString("en-IN")}</Fact>
            <Fact icon={LuCalendarDays} label="Planned completion">{formatDay(project.expectedCompletion)}</Fact>
            <Fact icon={LuClipboardList} label="Priority">{project.priority}</Fact>
            {project.materials.length > 0 && (
              <Fact icon={LuPackage} label="Materials needed">{project.materials.join(", ")}</Fact>
            )}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Project information" />
          <dl className="divide-y divide-surface-divider text-sm">
            {[
              ["Category", project.category],
              ["Priority", project.priority],
              ["Status", project.status],
              ["School", project.school.name],
              ["District", project.school.district],
              ["State", project.school.state],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 px-5 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900 break-words">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {donating && <PaymentFlowModal need={project} onClose={() => setDonating(false)} onConfirmed={refresh} onNeedChanged={refresh} />}
    </Shell>
  );
};

export default ProjectDetails;
