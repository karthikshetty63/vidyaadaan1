import { LuWallet } from "react-icons/lu";
import { formatINR } from "../../../utils/format";
import { RingCard, WaitingLink } from "../PortalWidgets";

// The school home page's own blocks (the shared ones are in ../PortalWidgets). They only show figures
// they are given, which the page counts from the school's own records.

/**
 * The main figure: money raised against the budgets of the school's approved projects. The ring only
 * appears when there is a real goal (at least one approved project); otherwise it says why there isn't.
 * `committed` is what NGOs have promised (null while unknown).
 */
export const FundingCard = ({ loading, failed, raised, goal, committed, committedLoading, paymentsToCheck, className = "" }) => (
  <RingCard
    id="funding"
    icon={LuWallet}
    title="Funding"
    subtitle="Across your approved projects"
    link={{ to: "/dashboard/school/donations", label: "Donation history" }}
    loading={loading}
    loadingLabel="Loading funding…"
    failed={failed}
    failedText="Funding can’t be shown right now. Try reloading the page."
    value={raised}
    goal={goal}
    centerLabel="funded"
    srText={(percent) => `${formatINR(raised)} raised of ${formatINR(goal)}, ${percent}% funded.`}
    facts={[
      { label: "Raised", value: formatINR(raised), tone: "text-emerald-700" },
      { label: "Goal", value: formatINR(goal) },
      { label: "Still needed", value: formatINR(Math.max(goal - raised, 0)) },
      ...(committed !== null ? [{ label: "Promised by NGOs", value: formatINR(committed), tone: "text-primary-700", loading: committedLoading }] : []),
    ]}
    empty={{ title: "No funding goal yet", text: "Funding starts once the VIDYADAAN team approves one of your projects. Its budget then becomes your goal here." }}
    footer={
      paymentsToCheck > 0 && (
        <WaitingLink to="/dashboard/school/donations">
          <span className="font-semibold">{paymentsToCheck} {paymentsToCheck === 1 ? "payment" : "payments"}</span> from NGOs to check
        </WaitingLink>
      )
    }
    className={className}
  />
);

/**
 * Where every project stands, as one bar and a legend. `stages` are [{ key, label, count, color }]; the
 * bar shows the stages that have projects, the legend lists every stage with its count.
 */
export const PipelineBar = ({ stages, total }) => (
  <div>
    <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
      {stages.filter((s) => s.count > 0).map((s) => (
        <span key={s.key} className={`h-full ${s.color}`} style={{ width: `${(s.count / total) * 100}%` }} />
      ))}
    </div>
    {/* Two columns on phones; one flowing row on larger screens. */}
    <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-8">
      {stages.map((s) => (
        <li key={s.key} className="flex items-center gap-2 text-sm sm:whitespace-nowrap">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.color}`} aria-hidden="true" />
          <span className="text-slate-600">{s.label}</span>
          <span className="ml-auto font-bold tabular-nums text-slate-900 sm:ml-1">{s.count}</span>
        </li>
      ))}
    </ul>
  </div>
);
