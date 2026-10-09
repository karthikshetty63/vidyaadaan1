// The sign-in page (school, NGO or donor) last used on this device, so /login opens it again.
// Storage can be unavailable (private mode), so every access is guarded.
const LAST_PORTAL_KEY = "vidyadaan:last-portal";
const PORTALS = ["school", "ngo", "donor"];

export const readLastPortal = () => {
  try {
    const portal = localStorage.getItem(LAST_PORTAL_KEY);
    return PORTALS.includes(portal) ? portal : "";
  } catch {
    return "";
  }
};

export const writeLastPortal = (portal) => {
  if (!PORTALS.includes(portal)) return;
  try {
    localStorage.setItem(LAST_PORTAL_KEY, portal);
  } catch {
    /* storage unavailable: nothing to remember */
  }
};
