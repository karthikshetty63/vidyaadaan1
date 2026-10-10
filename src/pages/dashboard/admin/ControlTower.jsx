import { useSearchParams } from "react-router-dom";
import { LuShieldCheck } from "react-icons/lu";
import ActivitySection from "../../../components/admin/tower/ActivitySection";
import FinanceSection from "../../../components/admin/tower/FinanceSection";
import OverviewSection from "../../../components/admin/tower/OverviewSection";
import RecordsSection from "../../../components/admin/tower/RecordsSection";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import PageHeader from "../../../components/ui/PageHeader";
import { useAuth } from "../../../context/AuthContext";

// The sections, in the order they appear. The current one lives in the address (?view=), so a refresh or a
// shared link keeps it.
const VIEWS = [
  ["overview", "Overview"],
  ["activity", "Activity"],
  ["schools", "Schools"],
  ["ngos", "NGOs"],
  ["donors", "Donors"],
  ["projects", "Projects"],
  ["finance", "Finance"],
];

/**
 * The admin Control Tower: read-only monitoring of every portal. It shows what the records and the
 * activity log say, refreshed every 30 seconds while open. It can't change anything: approvals stay on
 * the Account approvals page.
 */
const ControlTower = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = VIEWS.some(([key]) => key === searchParams.get("view")) ? searchParams.get("view") : "overview";
  const open = (next, extra = {}) => setSearchParams(next === "overview" ? {} : { view: next, ...extra });

  return (
    <DashboardLayout role="admin" userName={user?.name || "Admin"} userSub={user?.email || "Platform admin"} title="Control Tower" subtitle="Monitoring every portal">
      <main className="flex-1 overflow-y-auto">
        {/* Extra room at the bottom, so the last row and the page buttons clear the help button. */}
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          <PageHeader
            title="Control Tower"
            description="What is happening across the school, NGO and donor portals, from VIDYADAAN's own records. Read-only: nothing here changes a record."
            actions={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                <LuShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Admins only
              </span>
            }
          />

          <nav aria-label="Control Tower sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max gap-1 border-b border-slate-200">
              {VIEWS.map(([key, label]) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => open(key)}
                    aria-current={view === key ? "page" : undefined}
                    className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                      view === key ? "border-primary-600 text-primary-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Keyed by section so each starts fresh (its own filters and refresh timer). */}
          <div key={view}>
            {view === "overview" && <OverviewSection onOpenFinance={() => open("finance")} />}
            {view === "activity" && <ActivitySection />}
            {["schools", "ngos", "donors", "projects"].includes(view) && <RecordsSection kind={view} />}
            {view === "finance" && <FinanceSection initialStatus={searchParams.get("status") || ""} />}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default ControlTower;
