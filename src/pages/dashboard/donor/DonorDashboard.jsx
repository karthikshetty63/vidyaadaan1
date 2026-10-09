import { useState } from "react";
import { LuBadgeCheck, LuCalendarDays, LuCircleCheck, LuClipboardList, LuHandCoins, LuIndianRupee, LuLock } from "react-icons/lu";
import DashboardHero from "../../../components/dashboard/DashboardHero";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import NeedCard from "../../../components/dashboard/NeedCard";
import ReportDownloads from "../../../components/dashboard/ReportDownloads";
import PaymentFlowModal from "../../../components/payment/PaymentFlowModal";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import Card, { CardHeader } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import SectionHeader from "../../../components/ui/SectionHeader";
import SegmentedControl from "../../../components/ui/SegmentedControl";
import StatCard from "../../../components/ui/StatCard";
import { useAuth } from "../../../context/AuthContext";
import useApprovedProjects from "../../../hooks/useApprovedProjects";
import useMyDonations from "../../../hooks/useMyDonations";
import { formatINR } from "../../../utils/format";
import { displayValue } from "../../../utils/report";
import { buildDonorReport } from "../../../utils/reportCards";

const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// What happens to a donation, as the server actually handles it (see donationController).
const HOW_DONATIONS_WORK = [
  { icon: LuBadgeCheck, title: "Only approved needs", text: "Every need here was checked and approved by the VIDYADAAN team before it was listed." },
  { icon: LuLock, title: "Secure payment", text: "Razorpay handles the payment. VIDYADAAN never sees or stores your card, UPI or bank details." },
  { icon: LuCircleCheck, title: "Counted once confirmed", text: "A need's funding goes up only after Razorpay confirms your payment, and only once." },
];

/* ─── DONOR DASHBOARD ─────────────────────────────────────── */
const DonorDashboard = () => {
  const { user } = useAuth();
  // Approved school needs from the server (the donor view).
  const { projects: needs, loading: needsLoading, error: needsError, reload: reloadNeeds, refresh: refreshNeeds } = useApprovedProjects();
  // The need being donated to. After a confirmed donation its funding is reloaded from the server.
  const [donatingTo, setDonatingTo] = useState(null);
  const [needCategory, setNeedCategory] = useState("All");
  // The donor's own confirmed donations ("My donations" and the report card).
  const myDonations = useMyDonations();
  const donations = myDonations.donations;
  const givenTotal = donations.reduce((sum, d) => sum + d.amount, 0);
  const afterDonation = () => {
    refreshNeeds();
    myDonations.refresh();
  };

  // Every figure is counted from the approved needs above — nothing is estimated.
  const ready = !needsLoading && !needsError;
  const open = needs.filter((n) => n.raised < n.budget);
  const openSchools = new Set(open.map((n) => `${n.school.name}|${n.school.district}|${n.school.state}`)).size;
  const stillNeeded = open.reduce((sum, n) => sum + n.budget - n.raised, 0);
  const raised = needs.reduce((sum, n) => sum + n.raised, 0);
  const target = needs.reduce((sum, n) => sum + n.budget, 0);
  const fullyFunded = needs.length - open.length;
  const stats = [
    { label: "Open school needs", value: open.length, icon: LuClipboardList, tone: "indigo", hint: open.length ? `In ${plural(openSchools, "school", "schools")}` : undefined },
    { label: "Still needed", value: formatINR(stillNeeded), icon: LuIndianRupee, tone: "amber", hint: open.length ? "To fully fund the open needs" : undefined },
    { label: "Raised so far", value: formatINR(raised), icon: LuHandCoins, tone: "emerald", hint: needs.length ? `of ${formatINR(target)}, from NGOs and donors` : undefined },
    { label: "Fully funded", value: fullyFunded, icon: LuCircleCheck, tone: "rose", hint: needs.length ? `of ${plural(needs.length, "approved need", "approved needs")}` : undefined },
  ];

  const firstName = (user?.name || "").trim().split(/\s+/)[0];
  let summary = "Fund verified needs in government schools and follow how close each one is to its target.";
  if (ready && open.length) {
    summary = `${plural(open.length, "approved need", "approved needs")} in ${plural(openSchools, "government school", "government schools")} ${open.length === 1 ? "is" : "are"} waiting for support.`;
  } else if (ready) {
    summary = "No school needs are open right now. New ones appear here as soon as the VIDYADAAN team approves them.";
  }

  // Only categories that actually have a need are offered.
  const needCategories = [...new Set(needs.map((n) => n.category))].sort();
  const filteredNeeds = needs.filter((n) => needCategory === "All" || n.category === needCategory);

  return (
    <DashboardLayout
      role="donor"
      userName={user?.name || "Donor"}
      userSub={user?.email || "Individual donor"}
      title="Donor dashboard"
      subtitle={`Signed in as ${user?.email || "donor"}`}
    >
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
          <section id="overview" aria-label="Overview" className="scroll-mt-6 space-y-6">
            <DashboardHero
              eyebrow="Donor portal"
              title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
              description={summary}
              actions={<Button icon={LuClipboardList} onClick={() => scrollToSection("needs")}>Browse school needs</Button>}
            />
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((card) => (
                <StatCard key={card.label} label={card.label} value={ready ? card.value : "–"} icon={card.icon} tone={card.tone} hint={ready ? card.hint : undefined} />
              ))}
            </div>
          </section>

          <section id="needs" aria-labelledby="needs-heading" className="scroll-mt-6 space-y-4">
            <SectionHeader
              id="needs-heading"
              title="School infrastructure needs"
              description="Requests from government schools that the VIDYADAAN team has checked and approved."
              actions={
                needs.length > 0 && (
                  <SegmentedControl
                    label="Filter needs by category"
                    value={needCategory}
                    onChange={setNeedCategory}
                    options={["All", ...needCategories].map((c) => ({ value: c, label: c }))}
                  />
                )
              }
            />
            {needsError && (
              <Alert tone="danger">
                {needsError}{" "}
                <button type="button" onClick={reloadNeeds} className="font-medium underline underline-offset-2">Try again</button>
              </Alert>
            )}
            {needsLoading && <Card><p className="px-5 py-4 text-sm text-slate-500" role="status">Loading school needs…</p></Card>}
            {!needsLoading && !needsError && needs.length === 0 && (
              <Card>
                <EmptyState
                  icon={LuClipboardList}
                  title="No approved school needs yet."
                  description="When the VIDYADAAN team approves a school's request, it will appear here."
                />
              </Card>
            )}
            {!needsLoading && needs.length > 0 && (
              filteredNeeds.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredNeeds.map((need) => (
                    <NeedCard key={need.id} need={need} onDonate={setDonatingTo} />
                  ))}
                </div>
              ) : (
                <Card><EmptyState title="No needs in this category" description="Try another category." /></Card>
              )
            )}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card as="section" id="donations" aria-labelledby="donations-heading" className="xl:col-span-2 scroll-mt-6 overflow-hidden">
              <CardHeader
                title={<span id="donations-heading">My donations</span>}
                description={
                  donations.length
                    ? `${formatINR(givenTotal)} given in ${plural(donations.length, "donation", "donations")}, confirmed by Razorpay`
                    : "Your confirmed donations and their receipts"
                }
                actions={donations.length > 0 && <ReportDownloads kind="donor" buildReport={() => buildDonorReport({ user, donations })} />}
              />
              {myDonations.loading && <p className="px-5 py-4 text-sm text-slate-500" role="status">Loading your donations…</p>}
              {!myDonations.loading && myDonations.error && (
                <p className="px-5 py-4 text-sm text-slate-600">
                  {myDonations.error}{" "}
                  <button type="button" onClick={myDonations.reload} className="font-medium text-primary-700 underline underline-offset-2">Try again</button>
                </p>
              )}
              {!myDonations.loading && !myDonations.error && donations.length === 0 && (
                <EmptyState
                  icon={LuHandCoins}
                  title="No donations yet"
                  description="When you donate to a school need, it appears here once Razorpay confirms the payment, with its payment ID as your receipt."
                  action={<Button variant="secondary" onClick={() => scrollToSection("needs")}>Browse school needs</Button>}
                />
              )}
              {donations.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-surface-muted text-left">
                        {["Date", "School need", "School", "Amount", "Payment ID"].map((h) => (
                          <th key={h} scope="col" className={`whitespace-nowrap px-5 py-2.5 text-xs font-medium text-slate-500 ${h === "Amount" ? "text-right" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {donations.map((d) => (
                        <tr key={d.id}>
                          <td className="whitespace-nowrap px-5 py-3 text-slate-600">{displayValue(d.verifiedAt || d.createdAt, "date")}</td>
                          <td className="min-w-44 px-5 py-3 font-medium text-slate-900">{d.project.title}</td>
                          <td className="min-w-40 px-5 py-3 text-slate-600">
                            {d.school.name}
                            {(d.school.district || d.school.state) && <span className="block text-xs text-slate-500">{[d.school.district, d.school.state].filter(Boolean).join(", ")}</span>}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums text-slate-900">{formatINR(d.amount)}</td>
                          <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-600">
                            {d.paymentId}
                            {d.mode === "test" && <span className="ml-2 rounded-full bg-amber-50 px-1.5 py-0.5 font-sans text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">Test</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card as="section" aria-labelledby="how-heading">
              <CardHeader title={<span id="how-heading">How your donation is handled</span>} />
              <ul className="space-y-4 p-5">
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
          </div>

          <Card as="section" id="events" aria-labelledby="events-heading" className="scroll-mt-6">
            <CardHeader title={<span id="events-heading">School events</span>} />
            <EmptyState
              icon={LuCalendarDays}
              title="No school events yet"
              description="Sponsoring school events is coming soon. Events that schools ask donors to support will appear here."
              className="py-10"
            />
          </Card>
        </div>
      </main>

      {/* After a confirmed donation the needs and "My donations" reload from the server; when the need has changed, the needs do. */}
      {donatingTo && <PaymentFlowModal need={donatingTo} onClose={() => setDonatingTo(null)} onConfirmed={afterDonation} onNeedChanged={refreshNeeds} />}
    </DashboardLayout>
  );
};

export default DonorDashboard;
