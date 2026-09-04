import React from "react";

const AvatarGroup = ({ avatars = [], max = 4, label = "" }) => {
  const displayedAvatars = avatars.slice(0, max);
  const extra = avatars.length - max;

  const fallbackColors = [
    "bg-sky-400",
    "bg-emerald-400",
    "bg-purple-400",
    "bg-amber-400",
    "bg-pink-400",
    "bg-teal-400",
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {displayedAvatars.map((avatar, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full border-2 border-white overflow-hidden flex-shrink-0 ${
              index !== 0 ? "-ml-2.5" : ""
            } shadow-sm`}
            style={{ zIndex: displayedAvatars.length - index }}
            title={avatar.name || ""}
          >
            {avatar.src ? (
              <img
                src={avatar.src}
                alt={avatar.name || "Donor"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${
                  fallbackColors[index % fallbackColors.length]
                }`}
              >
                {(avatar.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {extra > 0 && (
          <div
            className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 -ml-2.5 shadow-sm"
            style={{ zIndex: 0 }}
          >
            +{extra}
          </div>
        )}
      </div>
      {label && (
        <span className="text-sm text-slate-500 font-medium">{label}</span>
      )}
    </div>
  );
};

export default AvatarGroup;
