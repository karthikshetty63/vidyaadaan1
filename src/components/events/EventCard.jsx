import React from "react";
import { getFundingSummary } from "../../utils/funding";

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
    ngoPartner,
  } = event || {};

  const { budget: targetBudget, amountRaised: currentRaised, fundingPercentage: pct } = getFundingSummary({
    requiredBudget: requiredBudget ?? event?.budget ?? event?.donationGoal ?? 45000,
    raisedAmount: raisedAmount ?? event?.raisedAmount ?? 0,
  });
  const sponsoredCount = requestedItems.filter((i) => i.sponsored).length;
  const totalItemsCount = requestedItems.length;

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      {/* Banner & Overlay */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <img
          src={banner}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow">
            🎉 {category}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold shadow flex items-center gap-1">
            <span>📅</span> {date}
          </span>
        </div>

        {/* School & District on banner bottom */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-200">
            <span>🏫</span> {schoolName}
          </div>
          <p className="text-[10px] text-slate-300 font-medium">📍 {district}</p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Stats pills */}
          <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1">
              <span className="text-base">👦</span>
              <span><strong>{expectedStudents}</strong> Kids</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1">
              <span className="text-base">📦</span>
              <span><strong>{sponsoredCount}/{totalItemsCount}</strong> Items Sponsored</span>
            </div>
          </div>

          {/* Requested Items Chips */}
          <div className="mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Requested Support Items:</p>
            <div className="flex flex-wrap gap-1.5">
              {requestedItems.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${item.sponsored
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  title={item.sponsored ? `Sponsored by ${item.sponsorName}` : `Needs sponsorship (₹${item.cost})`}
                >
                  {item.sponsored ? "✓ " : "⏳ "}{item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-extrabold text-slate-900">
              ₹{currentRaised.toLocaleString("en-IN")} <span className="text-[10px] font-medium text-slate-400">raised</span>
            </span>
            <span className="font-bold text-slate-500 text-[11px]">
              Goal ₹{targetBudget.toLocaleString("en-IN")} ({pct}%)
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct >= 100
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-400"
                }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Action Buttons based on Role */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {status === "Completed" ? (
              <button
                onClick={() => onViewDetails && onViewDetails(event)}
                className="w-full h-11 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs rounded-full hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🏆</span> Event Completed — View Impact
              </button>
            ) : userRole === "school" ? (
              <>
                <button
                  onClick={() => onPostEventUpload && onPostEventUpload(event)}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>📸</span> Upload Event Proof
                </button>
                <button
                  onClick={() => onViewDetails && onViewDetails(event)}
                  className="h-11 px-4 border border-slate-200 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
                >
                  Details
                </button>
              </>
            ) : userRole === "ngo" ? (
              <>
                <button
                  onClick={() => onSponsorItems && onSponsorItems(event)}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>🤝</span> Support & Assign Volunteers
                </button>
                <button
                  onClick={() => onViewDetails && onViewDetails(event)}
                  className="h-11 px-4 border border-slate-200 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
                >
                  Review
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onSponsorItems && onSponsorItems(event)}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>🎁</span> Sponsor Items
                </button>
                <button
                  onClick={() => onDonateAmount && onDonateAmount(event)}
                  className="h-11 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-full shadow-md shadow-amber-500/20 transition-all"
                >
                  💙 Donate
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
