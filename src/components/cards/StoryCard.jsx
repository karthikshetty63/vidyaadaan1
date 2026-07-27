import React from "react";

const StoryCard = ({ story }) => {
  const { studentName, age, grade, school, image, quote, achievement } = story;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Photo */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={studentName}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-base leading-tight">{studentName}</p>
          <p className="text-slate-300 text-xs mt-0.5">
            {age} yrs • {grade} • {school}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5 gap-3">
        {/* Quote */}
        <blockquote className="relative">
          <span className="absolute -top-1 -left-1 text-sky-200 text-4xl font-serif leading-none">"</span>
          <p className="text-slate-600 text-sm leading-relaxed italic pl-4 pt-2">
            {quote}
          </p>
        </blockquote>

        {/* Achievement badge */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            {achievement}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
