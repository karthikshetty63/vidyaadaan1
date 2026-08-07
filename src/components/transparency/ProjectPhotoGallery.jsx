import React, { useState } from "react";

const TABS = [
  { id: "before", label: "Before", icon: "📷", color: "red" },
  { id: "progress", label: "Progress", icon: "🏗️", color: "amber" },
  { id: "completed", label: "Completed", icon: "✅", color: "emerald" },
];

const statusBadge = {
  verified: {
    cls: "bg-emerald-100 text-emerald-700 border-emerald-300",
    icon: "🟢",
    label: "NGO Verified",
  },
  pending: {
    cls: "bg-amber-100 text-amber-700 border-amber-300",
    icon: "🟡",
    label: "Awaiting NGO Verification",
  },
  rejected: {
    cls: "bg-red-100 text-red-700 border-red-300",
    icon: "🔴",
    label: "Returned for Correction",
  },
};

const tabActive = {
  before: "bg-red-600 text-white shadow-md shadow-red-600/20",
  progress: "bg-amber-500 text-white shadow-md shadow-amber-500/20",
  completed: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
};

const tabInactive = "bg-white text-slate-600 border border-slate-200 hover:border-slate-300";

const ProjectPhotoGallery = ({
  photos,
  role = "donor",
  onUploadClick = null,
  onVerifyClick = null,
  onRejectClick = null,
}) => {
  const [activeTab, setActiveTab] = useState("before");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filtered = photos.filter((p) => p.tab === activeTab);

  const featuredPhoto = selectedPhoto && selectedPhoto.tab === activeTab
    ? selectedPhoto
    : filtered[0] || null;

  return (
    <div className="space-y-6">
      {/* Tab Pills */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedPhoto(null);
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id ? tabActive[tab.id] : tabInactive
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                activeTab === tab.id ? "bg-white/30" : "bg-slate-100 text-slate-600"
              }`}
            >
              {photos.filter((p) => p.tab === tab.id).length}
            </span>
          </button>
        ))}

        {/* School Upload CTA */}
        {role === "school" && onUploadClick && (
          <button
            onClick={onUploadClick}
            className="ml-auto px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <span>📸</span> Upload Photo
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center">
          <span className="text-4xl block mb-3">📷</span>
          <p className="font-bold text-slate-700 text-sm">No photos uploaded yet for this stage</p>
          {role === "school" && (
            <button
              onClick={onUploadClick}
              className="mt-4 px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-colors"
            >
              Upload First Photo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Photo View */}
          {featuredPhoto && (
            <div className="lg:col-span-2 bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-xl">
              <div className="relative h-72 sm:h-80 bg-slate-900">
                <img
                  src={featuredPhoto.image}
                  alt={featuredPhoto.title}
                  className="w-full h-full object-cover"
                />
                {/* Stage badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {featuredPhoto.stageLabel}
                  {featuredPhoto.stagePercent > 0 && ` — ${featuredPhoto.stagePercent}%`}
                </div>
                {/* Verification badge */}
                <div
                  className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${
                    statusBadge[featuredPhoto.verificationStatus]?.cls
                  }`}
                >
                  {statusBadge[featuredPhoto.verificationStatus]?.icon}{" "}
                  {statusBadge[featuredPhoto.verificationStatus]?.label}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{featuredPhoto.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{featuredPhoto.desc}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Uploaded By:</span>
                    <span className="font-bold text-slate-800">{featuredPhoto.uploadedBy}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Upload Date:</span>
                    <span className="font-bold text-slate-800">{featuredPhoto.uploadDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Geotag:</span>
                    <span className="font-mono text-emerald-600 font-bold">{featuredPhoto.geoCoords}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Verification:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        featuredPhoto.verificationStatus === "verified"
                          ? "text-emerald-600"
                          : featuredPhoto.verificationStatus === "pending"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {statusBadge[featuredPhoto.verificationStatus]?.icon}{" "}
                      {statusBadge[featuredPhoto.verificationStatus]?.label}
                    </span>
                  </div>
                </div>

                {/* NGO Remark */}
                {featuredPhoto.ngoRemark && (
                  <div
                    className={`px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      featuredPhoto.verificationStatus === "verified"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    <span className="font-black block mb-0.5">
                      {featuredPhoto.verificationStatus === "verified" ? "🟢 NGO Remark:" : "🔴 NGO Rejection Reason:"}
                    </span>
                    {featuredPhoto.ngoRemark}
                  </div>
                )}

                {/* NGO Action Buttons */}
                {role === "ngo" && featuredPhoto.verificationStatus === "pending" && (
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => onVerifyClick && onVerifyClick(featuredPhoto)}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-full shadow-md shadow-emerald-600/20 transition-colors flex items-center justify-center gap-1.5"
                    >
                      ✓ Verify & Approve
                    </button>
                    <button
                      onClick={() => onRejectClick && onRejectClick(featuredPhoto)}
                      className="flex-1 h-10 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-extrabold rounded-full border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      ✗ Return for Correction
                    </button>
                  </div>
                )}

                {/* School edit button for rejected/pending */}
                {role === "school" &&
                  (featuredPhoto.verificationStatus === "rejected" ||
                    featuredPhoto.verificationStatus === "pending") && (
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => onUploadClick && onUploadClick(featuredPhoto)}
                        className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-full shadow-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        ✏️ Edit / Re-upload Photo
                      </button>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Thumbnail Sidebar */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              {filtered.length} Photo{filtered.length !== 1 ? "s" : ""} in this stage:
            </h4>
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filtered.map((photo) => {
                const badge = statusBadge[photo.verificationStatus];
                const isSelected = featuredPhoto?.id === photo.id;
                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all hover:shadow-md ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={photo.image}
                        alt={photo.title}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs leading-none">
                        {badge?.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{photo.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{photo.uploadDate}</p>
                      <span
                        className={`inline-flex items-center gap-0.5 mt-0.5 text-[9px] font-black px-2 py-0.5 rounded-full border ${badge?.cls}`}
                      >
                        {badge?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhotoGallery;
