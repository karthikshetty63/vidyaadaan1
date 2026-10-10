// Formatting for the Control Tower (numbers in Indian style, dates in en-IN).

export const formatINR = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
export const formatNumber = (n) => Number(n || 0).toLocaleString("en-IN");
export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
export const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const formatTime = (value) => (value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—");

/** "3 days" / "5 hours" / "under an hour" since `value`. */
export const ageOf = (value) => {
  if (!value) return "";
  const hours = (Date.now() - new Date(value).getTime()) / 3600000;
  if (hours < 1) return "under an hour";
  if (hours < 48) return `${Math.floor(hours)} hour${Math.floor(hours) === 1 ? "" : "s"}`;
  return `${Math.floor(hours / 24)} days`;
};

export const ROLE_LABELS = { school: "School", ngo: "NGO", donor: "Donor", admin: "Admin", visitor: "Visitor", system: "System" };
