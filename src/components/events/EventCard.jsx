import { LuCalendar, LuCircleCheck, LuMapPin } from "react-icons/lu";
import { getFundingSummary } from "../../utils/funding";
import Badge, { StatusBadge } from "../ui/Badge";
import Button from "../ui/Button";
import CoverImage from "../ui/CoverImage";
import ProgressBar from "../ui/ProgressBar";

const EventCard = ({
  event,
  onSponsorItems,
  onDonateAmount,
  onViewDetails,
  onPostEventUpload,
  userRole = "donor",
}) => {
  const {
    title,
    category,
    schoolName,
    district,
    date,
    expectedStudents,
    requiredBudget,
    raisedAmount,
    banner,
    requestedItems = [],
    status,
  } = event || {};

  const { budget: targetBudget, amountRaised: currentRaised, fundingPercentage: pct } = getFundingSummary({
    requiredBudget: requiredBudget ?? event?.budget ?? event?.donationGoal ?? 45000,
    raisedAmount: raisedAmount ?? event?.raisedAmount ?? 0,
  });
  const sponsoredCount = requestedItems.filter((i) => i.sponsored).length;
  const totalItemsCount = requestedItems.length;

  return (
    <article className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <CoverImage src={banner} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{category}</Badge>
          {status && <StatusBadge status={status} />}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{schoolName}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><LuMapPin className="w-3.5 h-3.5" aria-hidden="true" /> {district}</span>
          <span className="inline-flex items-center gap-1"><LuCalendar className="w-3.5 h-3.5" aria-hidden="true" /> {date}</span>
        </div>

        {(expectedStudents || totalItemsCount > 0 || event?.requiredItems?.length > 0) && (
          <p className="mt-3 text-xs text-slate-600">
            {[
              expectedStudents ? `${expectedStudents} students` : null,
              totalItemsCount > 0
                ? `${sponsoredCount} of ${totalItemsCount} items sponsored`
                : event?.requiredItems?.length > 0
                  ? `${event.requiredItems.length} items requested`
                  : null,
            ].filter(Boolean).join(" · ")}
          </p>
        )}

        {totalItemsCount > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Requested support items">
            {requestedItems.map((item, idx) => (
              <li
                key={idx}
                title={item.sponsored ? `Sponsored by ${item.sponsorName}` : `Needs sponsorship (₹${item.cost})`}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ring-1 ring-inset ${
                  item.sponsored ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-slate-50 text-slate-700 ring-slate-200"
                }`}
              >
                {item.sponsored && <LuCircleCheck className="w-3 h-3" aria-label="Sponsored" />}
                {item.label}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span><span className="font-medium text-slate-900">₹{currentRaised.toLocaleString("en-IN")}</span> raised</span>
            <span className="tabular-nums">Goal ₹{targetBudget.toLocaleString("en-IN")} · {pct}%</span>
          </div>
          <ProgressBar value={pct} label={`${title} funding`} />

          <div className="mt-4 flex gap-2">
            {status === "Completed" ? (
              <Button variant="secondary" fullWidth onClick={() => onViewDetails && onViewDetails(event)}>View impact</Button>
            ) : userRole === "school" ? (
              <>
                <Button className="flex-1" onClick={() => onPostEventUpload && onPostEventUpload(event)}>Upload event proof</Button>
                <Button variant="secondary" onClick={() => onViewDetails && onViewDetails(event)}>Details</Button>
              </>
            ) : userRole === "ngo" ? (
              <>
                <Button className="flex-1" onClick={() => onSponsorItems && onSponsorItems(event)}>Support & assign</Button>
                <Button variant="secondary" onClick={() => onViewDetails && onViewDetails(event)}>Review</Button>
              </>
            ) : (
              <>
                <Button className="flex-1" onClick={() => onSponsorItems && onSponsorItems(event)}>Sponsor items</Button>
                <Button variant="secondary" onClick={() => onDonateAmount && onDonateAmount(event)}>Donate</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
