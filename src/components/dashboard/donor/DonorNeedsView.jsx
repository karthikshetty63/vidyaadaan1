import { useState } from "react";
import { LuClipboardList } from "react-icons/lu";
import NeedCard from "../NeedCard";
import Alert from "../../ui/Alert";
import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import PageHeader from "../../ui/PageHeader";
import SegmentedControl from "../../ui/SegmentedControl";

/** Every approved school need a donor can give to, with a category filter. */
const DonorNeedsView = ({ needs, loading, error, onRetry, notice, onDonate, onDetails }) => {
  const [category, setCategory] = useState("All");
  // Only categories that actually have a need are offered.
  const categories = [...new Set(needs.map((n) => n.category))].sort();
  const shownCategory = category === "All" || categories.includes(category) ? category : "All";
  const filtered = needs.filter((n) => shownCategory === "All" || n.category === shownCategory);

  return (
    <>
      <PageHeader
        title="School needs"
        description="Requests from government schools that the VIDYADAAN team has checked and approved. Open one to read it in full, then donate securely through Razorpay."
        actions={
          needs.length > 0 && (
            <SegmentedControl label="Filter needs by category" value={shownCategory} onChange={setCategory} options={["All", ...categories].map((c) => ({ value: c, label: c }))} />
          )
        }
      />
      {notice}
      {error && (
        <Alert tone="danger">
          {error} <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
        </Alert>
      )}
      {loading && <Card><p className="px-5 py-10 text-center text-sm text-slate-500" role="status">Loading school needs…</p></Card>}
      {!loading && !error && needs.length === 0 && (
        <Card>
          <EmptyState icon={LuClipboardList} title="No approved school needs yet" description="When the VIDYADAAN team approves a school's request, it will appear here." />
        </Card>
      )}
      {!loading && needs.length > 0 && (
        filtered.length ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((need) => <NeedCard key={need.id} need={need} onDonate={onDonate} onDetails={onDetails} />)}
          </div>
        ) : (
          <Card><EmptyState title="No needs in this category" description="Try another category." /></Card>
        )
      )}
    </>
  );
};

export default DonorNeedsView;
