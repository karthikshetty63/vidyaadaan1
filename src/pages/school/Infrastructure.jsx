import { useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { FaBuilding, FaDesktop, FaToilet, FaBook, FaFutbol, FaWater, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const conditionVariant = {
  Good: "emerald",
  Fair: "yellow",
  Poor: "red",
  "Needs Repair": "red",
};

const infrastructureItems = [
  {
    id: 1,
    icon: FaBuilding,
    name: "Classrooms",
    total: 8,
    functional: 6,
    condition: "Fair",
    lastUpdated: "Jan 2025",
    notes: "2 classrooms have roof leakage. Repair request submitted.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: 2,
    icon: FaDesktop,
    name: "Computer Lab",
    total: 20,
    functional: 12,
    condition: "Poor",
    lastUpdated: "Dec 2024",
    notes: "8 computers are non-functional. Digital upgrade needed.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: 3,
    icon: FaToilet,
    name: "Toilet Blocks",
    total: 6,
    functional: 6,
    condition: "Good",
    lastUpdated: "Nov 2024",
    notes: "Renovated in Nov 2024 via VIDYADAAN donation.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: 4,
    icon: FaBook,
    name: "Library",
    total: 1,
    functional: 1,
    condition: "Fair",
    lastUpdated: "Jan 2025",
    notes: "Books are outdated. New books procurement in progress.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    id: 5,
    icon: FaFutbol,
    name: "Playground",
    total: 1,
    functional: 1,
    condition: "Needs Repair",
    lastUpdated: "Jan 2025",
    notes: "Playground equipment is damaged. Safety concern for students.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: 6,
    icon: FaWater,
    name: "Drinking Water",
    total: 3,
    functional: 3,
    condition: "Good",
    lastUpdated: "Oct 2024",
    notes: "RO purifier installed. All taps functional.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const conditionCounts = infrastructureItems.reduce((acc, item) => {
  acc[item.condition] = (acc[item.condition] || 0) + 1;
  return acc;
}, {});

const Infrastructure = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Infrastructure</h1>
          <p className="text-slate-500 text-sm mt-1">
            Current condition of your school's infrastructure
          </p>
        </div>
        <Link to="/school/create-issue">
          <Button>
            <FaPlus size={12} /> Raise Issue
          </Button>
        </Link>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: infrastructureItems.length, color: "text-slate-800" },
          { label: "Good Condition", value: conditionCounts["Good"] || 0, color: "text-emerald-600" },
          { label: "Fair Condition", value: conditionCounts["Fair"] || 0, color: "text-yellow-600" },
          { label: "Needs Repair", value: (conditionCounts["Poor"] || 0) + (conditionCounts["Needs Repair"] || 0), color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Infrastructure Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {infrastructureItems.map((item) => {
          const Icon = item.icon;
          const functionalPct = Math.round((item.functional / item.total) * 100);
          const isSelected = selected === item.id;

          return (
            <Card
              key={item.id}
              className={`p-5 cursor-pointer transition-all duration-200 ${
                isSelected ? "ring-2 ring-blue-500 shadow-xl" : "hover:shadow-lg"
              }`}
              onClick={() => setSelected(isSelected ? null : item.id)}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`text-lg ${item.iconColor}`} />
                </div>
                <Badge variant={conditionVariant[item.condition]}>{item.condition}</Badge>
              </div>

              {/* Name */}
              <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Last updated: {item.lastUpdated}</p>

              {/* Functional bar */}
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Functional</span>
                <span className="font-semibold text-slate-700">
                  {item.functional}/{item.total}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    functionalPct === 100
                      ? "bg-emerald-500"
                      : functionalPct >= 60
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${functionalPct}%` }}
                />
              </div>

              {/* Expanded Notes */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-slate-500 leading-5">{item.notes}</p>
                  <Link
                    to="/school/create-issue"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaPlus size={10} /> Raise Issue for this
                  </Link>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Infrastructure;
