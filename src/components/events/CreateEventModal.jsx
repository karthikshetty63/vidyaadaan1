import React, { useState } from "react";
import { eventCategories, supportItemsList } from "../../data/eventsData";

const inputCls = "w-full h-11 px-4 border-2 border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none transition-colors font-medium";
const labelCls = "block text-xs font-bold text-slate-700 mb-1.5";

const CreateEventModal = ({ isOpen, onClose, onCreateEvent }) => {
  const [form, setForm] = useState({
    title: "",
    category: "Sports Day",
    date: "",
    location: "",
    expectedStudents: "",
    requiredBudget: "",
    description: "",
    banner: "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=600&auto=format&fit=crop",
    selectedItems: ["food", "snacks", "trophies", "medals", "certificates"],
    timeline: "Preparation: 1 week | Event Day: 8 AM - 4 PM",
    docName: "",
  });

  if (!isOpen) return null;

  const handleToggleItem = (itemId) => {
    setForm((prev) => {
      const exists = prev.selectedItems.includes(itemId);
      return {
        ...prev,
        selectedItems: exists
          ? prev.selectedItems.filter((i) => i !== itemId)
          : [...prev.selectedItems, itemId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestedItems = form.selectedItems.map((id) => {
      const found = supportItemsList.find((i) => i.id === id);
      return {
        id,
        label: found ? found.label : id,
        cost: found ? found.estCost : 5000,
        sponsored: false,
        sponsorName: null,
      };
    });

    const newEvent = {
      id: "evt-" + Date.now(),
      title: form.title || "School Celebration & Event",
      category: form.category,
      schoolName: "Honnali Govt. Primary School",
      district: "Davangere, Karnataka",
      udise: "29140112801",
      date: form.date || "Upcoming Date",
      location: form.location || "School Grounds",
      expectedStudents: Number(form.expectedStudents) || 250,
      requiredBudget: Number(form.requiredBudget) || 45000,
      raisedAmount: 0,
      banner: form.banner,
      description: form.description || "School event seeking NGO and donor support for student activities.",
      requestedItems,
      status: "Active",
      ngoPartner: null,
      volunteersAssigned: 0,
      impactReport: null,
    };

    onCreateEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1">
              <span>🎉</span> Government School Events
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">Create New School Event Request</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Event Name / Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Annual Sports Meet & Cultural Fest 2026"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Event Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
              >
                {eventCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Event Date *</label>
              <input
                type="text"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. 15 Aug 2026 or 28 Oct 2026"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Expected Participating Students *</label>
              <input
                type="number"
                required
                value={form.expectedStudents}
                onChange={(e) => setForm({ ...form, expectedStudents: e.target.value })}
                placeholder="e.g. 350"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Estimated Total Budget (₹) *</label>
              <input
                type="number"
                required
                value={form.requiredBudget}
                onChange={(e) => setForm({ ...form, requiredBudget: e.target.value })}
                placeholder="e.g. 50000"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Event Location / Venue</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. School Playground, Honnali"
                className={inputCls}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Event Description & Objective *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explain the purpose of the event, activities planned, and why support is needed..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none transition-colors font-medium resize-none"
            />
          </div>

          {/* Requested Items Checklist */}
          <div>
            <label className={labelCls}>Select Required Support Items (Check all that apply):</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
              {supportItemsList.map((item) => {
                const checked = form.selectedItems.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      checked
                        ? "border-blue-600 bg-blue-50/80 text-blue-900"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-bold leading-tight flex-1">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className={labelCls}>Event Banner Image URL (Optional)</label>
            <input
              type="text"
              value={form.banner}
              onChange={(e) => setForm({ ...form, banner: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className={inputCls}
            />
          </div>

          {/* Verification note */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            ✅ Once submitted, your event request will be published on VIDYADAAN and shared with verified NGOs and donors.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all"
            >
              🚀 Create & Request Support
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
