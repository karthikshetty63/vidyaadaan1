import React from "react";
import { getFundingPercentage } from "../../utils/funding";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const ProjectCard = ({ project }) => {
  const {
    title,
    schoolName,
    location,
    category,
    image,
    targetAmount,
    raisedAmount,
    daysLeft,
    badgeColor = "bg-blue-600",
  } = project;

  const pct = getFundingPercentage(targetAmount, raisedAmount);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative group">
      {/* Image Container */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill Tag on bottom left of photo */}
        <div className={`absolute bottom-3 left-3 text-white text-[10px] font-extrabold px-3 py-1 rounded-md shadow ${badgeColor}`}>
          {category}
        </div>

        {/* Heart Save Button on top right of photo */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-blue-600 hover:text-red-500 hover:bg-white flex items-center justify-center shadow transition-colors"
          aria-label="Save project"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <span>📍</span> {schoolName || location}
          </p>
        </div>

        {/* Progress & Target */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-900">
              {formatCurrency(raisedAmount)}{" "}
              <span className="text-slate-400 font-normal">raised of {formatCurrency(targetAmount)}</span>
            </span>
            <span className="text-blue-600 font-extrabold">{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Days Left Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>{daysLeft} Days Left</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
