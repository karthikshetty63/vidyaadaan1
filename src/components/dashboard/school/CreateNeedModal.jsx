import React, { useState } from "react";

export const INFRA_16_CATEGORIES = [
  { id: "Classroom Development", label: "🏫 Classroom Development" },
  { id: "Library", label: "📚 Library" },
  { id: "Computer Lab", label: "💻 Computer Lab" },
  { id: "Science Laboratory", label: "🔬 Science Laboratory" },
  { id: "Drinking Water", label: "🚰 Drinking Water" },
  { id: "Electricity", label: "⚡ Electricity" },
  { id: "Toilets & Sanitation", label: "🚻 Toilets & Sanitation" },
  { id: "Playground", label: "⚽ Playground" },
  { id: "Campus Development", label: "🌳 Campus Development" },
  { id: "Mid-Day Meal", label: "🍛 Mid-Day Meal" },
  { id: "Transportation", label: "🚌 Transportation" },
  { id: "Inclusive Education", label: "♿ Inclusive Education" },
  { id: "Arts & Culture", label: "🎨 Arts & Culture" },
  { id: "Digital Learning", label: "🎓 Digital Learning" },
  { id: "Health & Wellness", label: "🩺 Health & Wellness" },
  { id: "Other Infrastructure", label: "📦 Other Infrastructure" },
];

const SAMPLE_BEFORE_PHOTOS = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=600&auto=format&fit=crop",
];

const CreateNeedModal = ({ isOpen, onClose, onCreateNeed }) => {
  const [category, setCategory] = useState("Classroom Development");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("High");
  const [budget, setBudget] = useState("120000");
  const [completionDate, setCompletionDate] = useState("2026-10-31");
  const [location, setLocation] = useState("Honnali, Davangere District");
  const [students, setStudents] = useState(240);
  const [materials, setMaterials] = useState("Smart TV, Dual Desks, Wiring Kit");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      const finalImage = photoUrl.trim() || SAMPLE_BEFORE_PHOTOS[selectedSampleIdx];
      const newNeed = {
        id: `need-created-${Date.now()}`,
        label: title.trim(),
        category,
        schoolName: "Honnali Govt. Primary School",
        district: location,
        amount: `₹${Number(budget).toLocaleString("en-IN")}`,
        progress: 0,
        priority,
        icon: INFRA_16_CATEGORIES.find((c) => c.id === category)?.label.split(" ")[0] || "📋",
        img: finalImage,
        desc: desc.trim(),
        studentsBenefited: Number(students),
        expectedDate: completionDate,
        requiredMaterials: materials.split(",").map((m) => m.trim()),
        status: "Pending NGO Audit",
        beforePhotos: [
          {
            id: `bp-${Date.now()}`,
            image: finalImage,
            title: `Before: ${title.trim()}`,
            desc: desc.trim(),
            uploadDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            uploadedBy: "School Admin",
            verificationStatus: "pending",
            stageLabel: "Before Work Started",
          },
        ],
      };

      onCreateNeed && onCreateNeed(newNeed);
      setSubmitting(false);
      onClose();
      // reset
      setTitle("");
      setDesc("");
      setPhotoUrl("");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-6 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1">
              <span>📋</span> Government School Infrastructure Request
            </div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              ➕ Add Infrastructure Need
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">Submit request to NGOs & Donors with Before evidence photos</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Category & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Infrastructure Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none bg-slate-50/50"
              >
                {INFRA_16_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none bg-slate-50/50"
              >
                <option value="Critical">🔴 Critical (Immediate Threat)</option>
                <option value="High">🟠 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">⚪ Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Infrastructure Need Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Classroom & Interactive Board Setup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Problem Description & Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the current condition, why this project is needed, and how it impacts students..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Budget, Completion Date, Students */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Estimated Budget (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Expected Completion Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Students Benefited <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={students}
                onChange={(e) => setStudents(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location & Materials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Location / School Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Required Materials (Comma Separated)</label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="e.g. Smart TV, Dual Desks, Wiring Kit"
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Upload Before Photos */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-extrabold text-slate-800">
              📷 Upload Before Evidence Photo <span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-slate-500">
              Select a sample photo or enter a custom photo URL showing the current state before work begins:
            </p>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {SAMPLE_BEFORE_PHOTOS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setSelectedSampleIdx(idx); setPhotoUrl(""); }}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedSampleIdx === idx && !photoUrl
                      ? "border-blue-600 scale-105 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img src={url} alt="sample before" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="Or paste image URL (https://...)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full h-10 px-4 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              {submitting ? "Submitting Request..." : "📋 Submit Infrastructure Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNeedModal;
