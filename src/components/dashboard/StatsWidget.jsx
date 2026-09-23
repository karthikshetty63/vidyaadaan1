import StatCard from "../ui/StatCard";

/** Row of KPI cards. `icon` should be a react-icons component (emoji strings are ignored). */
const StatsWidget = ({ stats = [] }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
    {stats.map(({ icon, label, value, change }) => (
      <StatCard key={label} label={label} value={value} change={change} icon={typeof icon === "string" ? undefined : icon} />
    ))}
  </div>
);

export default StatsWidget;
