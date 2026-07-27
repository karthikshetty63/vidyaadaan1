import React, { useState } from "react";

const SponsorEventModal = ({ isOpen, onClose, event, onSponsorSuccess }) => {
  const [activeTab, setActiveTab] = useState("items"); // "items", "entire", "custom"
  const [customAmount, setCustomAmount] = useState(2500);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [donorName, setDonorName] = useState("Ramesh Kumar");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !event) return null;

  const { title, schoolName, requiredBudget, raisedAmount, requestedItems = [] } = event;
  const remainingBudget = Math.max(0, requiredBudget - raisedAmount);

  const toggleItem = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const calculateItemsTotal = () => {
    return requestedItems
      .filter((i) => selectedItemIds.includes(i.id))
      .reduce((sum, i) => sum + i.cost, 0);
  };

  const handleSponsor = (e) => {
    e.preventDefault();
    let totalAmt = 0;
    let sponsoredItemLabels = [];

    if (activeTab === "entire") {
      totalAmt = remainingBudget;
      sponsoredItemLabels = ["Entire Event Package"];
    } else if (activeTab === "items") {
      totalAmt = calculateItemsTotal();
      sponsoredItemLabels = requestedItems
        .filter((i) => selectedItemIds.includes(i.id))
        .map((i) => i.label);
    } else {
      totalAmt = Number(customAmount) || 1000;
      sponsoredItemLabels = [`Custom Contribution of ₹${totalAmt}`];
    }

    setSubmitted(true);
    if (onSponsorSuccess) {
      onSponsorSuccess({
        eventId: event.id,
        donorName,
        totalAmt,
        sponsoredItemIds: selectedItemIds,
        sponsoredItemLabels,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1">
              <span>🎁</span> Support School Event
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">{title}</h2>
            <p className="text-xs text-amber-100 mt-0.5">🏫 {schoolName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto animate-bounce">
              🎉
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Thank You for Your Generosity!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your sponsorship for <strong>{schoolName}</strong>'s event has been confirmed. The school principal and students are deeply grateful for your support.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold max-w-sm mx-auto">
              📜 An 80G Tax Receipt and Event Completion Report will be delivered to your dashboard!
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-full shadow-lg shadow-amber-500/25 transition-all"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSponsor} className="p-6 sm:p-8 space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              {[
                { id: "items", label: "Sponsor Items" },
                { id: "entire", label: "Entire Event" },
                { id: "custom", label: "Custom Amount" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === t.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Donor Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name / Organisation *</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl text-xs font-medium focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Tab Content 1: Sponsor Items */}
            {activeTab === "items" && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Select Item Packages to Sponsor:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {requestedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !item.sponsored && toggleItem(item.id)}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        item.sponsored
                          ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                          : selectedItemIds.includes(item.id)
                          ? "bg-amber-50/80 border-amber-500 cursor-pointer shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={item.sponsored}
                          checked={selectedItemIds.includes(item.id) || item.sponsored}
                          onChange={() => {}}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.label}</p>
                          {item.sponsored && (
                            <p className="text-[10px] text-emerald-600 font-semibold">
                              ✓ Already sponsored by {item.sponsorName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">
                        ₹{item.cost.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content 2: Entire Event */}
            {activeTab === "entire" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl mx-auto shadow-md">
                  🏆
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Become Title Sponsor for Entire Event</h4>
                <p className="text-xs text-slate-600">
                  Cover the remaining budget of <strong>₹{remainingBudget.toLocaleString("en-IN")}</strong> to fulfill all requested items!
                </p>
                <div className="text-2xl font-black text-amber-600">₹{remainingBudget.toLocaleString("en-IN")}</div>
              </div>
            )}

            {/* Tab Content 3: Custom Amount */}
            {activeTab === "custom" && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Enter Contribution Amount (₹):</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full h-12 pl-8 pr-4 border-2 border-slate-200 rounded-xl text-base font-extrabold focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {[1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomAmount(amt)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50 text-slate-700 transition-colors"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total Summary & Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Sponsorship</span>
                <span className="text-xl font-black text-slate-900">
                  ₹
                  {activeTab === "entire"
                    ? remainingBudget.toLocaleString("en-IN")
                    : activeTab === "items"
                    ? calculateItemsTotal().toLocaleString("en-IN")
                    : Number(customAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeTab === "items" && selectedItemIds.length === 0}
                  className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs rounded-full shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
                >
                  🎁 Confirm Sponsorship
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SponsorEventModal;
